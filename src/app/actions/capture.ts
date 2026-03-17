'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function captureModalLead(formData: FormData) {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const course = formData.get('course') as string
    const state = formData.get('state') as string

    // 1. Initialize Supabase
    const supabase = await createClient()

    // 2. Insert directly into the Supabase 'leads' table
    const { data: newLead, error: leadError } = await supabase
      .from('leads')
      .insert([{
        name,
        email,
        phone,
        course_interest: course,
        source: 'EXIT_INTENT_MODAL',
        status: 'NEW_LEAD',
        priority: 'HIGH',
        notes: `Student Location: ${state}`
      }])
      .select()
      .single() // Returns the inserted row so we can get the ID

    if (leadError) throw new Error(leadError.message)

    // 3. Log the automatic creation activity in the timeline
    const { error: activityError } = await supabase
      .from('activities')
      .insert([{
        lead_id: newLead.id,
        type: 'SYSTEM',
        description: 'Lead captured automatically via Website Modal.',
        created_by: 'SYSTEM'
      }])

    if (activityError) console.error("Activity log failed:", activityError)

    // 4. Tell Next.js to refresh the CRM Kanban board in the background
    revalidatePath('/admin/pipeline')
    
    return { success: true }

  } catch (error: any) {
    console.error("Failed to capture lead:", error)
    return { error: "Failed to save lead to CRM" }
  }
}
