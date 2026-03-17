'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitApplication(courseId: string, universityId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Authentication required' }
  }

  try {
    // 1. Fetch student profile to check for fee waiver eligibility
    const { data: profile } = await supabase
      .from('student_profiles')
      .select('is_verified, score_percentage')
      .eq('user_id', user.id)
      .single()

    // 2. Fetch course data for fee info
    const { data: course } = await supabase
      .from('courses')
      .select('total_fee_inr')
      .eq('id', courseId)
      .single()

    if (!course) throw new Error('Course not found')

    // 3. Logic: Fee Waiver triggered if profile is verified OR score > 90
    // In a real production app, this would be a more complex partner-driven check
    const isEligibleForWaiver = profile?.is_verified || (profile?.score_percentage && profile.score_percentage >= 90)
    const waiverReason = isEligibleForWaiver 
      ? (profile?.is_verified ? 'Verified Active Profile' : 'Academic Excellence (90%+)') 
      : null

    // 4. Upsert the application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .upsert({
        user_id: user.id,
        course_id: courseId,
        university_id: universityId,
        status: 'DOCUMENTS_PENDING',
        is_fee_waived: isEligibleForWaiver,
        waiver_reason: waiverReason,
        total_fee_inr: course.total_fee_inr,
        final_fee_inr: isEligibleForWaiver ? 0 : 500 // ₹500 standard application fee vs ₹0 waiver
      }, { onConflict: 'user_id,course_id' })
      .select()
      .single()

    if (appError) throw appError

    // 5. Log Milestone if waiver unlocked
    if (isEligibleForWaiver) {
      await supabase.from('application_milestones').insert({
        application_id: application.id,
        milestone_name: 'Fee Waiver Unlocked',
        description: `Unlocked via ${waiverReason}`,
        is_completed: true,
        completed_at: new Date().toISOString()
      })
    }

    revalidatePath('/student/dashboard')
    return { success: true, applicationId: application.id, isFeeWaived: isEligibleForWaiver }

  } catch (error: any) {
    console.error('submitApplication error:', error)
    return { error: error.message || 'Failed to submit application' }
  }
}

export async function getStudentDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  try {
    // Fetch Saved Matches with full university/course data
    const { data: savedMatches } = await supabase
      .from('saved_matches')
      .select(`
        *,
        course:courses (
          *,
          universities (*)
        )
      `)
      .eq('user_id', user.id)

    // Fetch Active Applications
    const { data: applications } = await supabase
      .from('applications')
      .select(`
        *,
        course:courses (*),
        university:universities (*)
      `)
      .eq('user_id', user.id)

    return {
      savedMatches: savedMatches || [],
      applications: applications || []
    }

  } catch (error) {
    console.error('getStudentDashboardData error:', error)
    return null
  }
}
