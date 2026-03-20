"use server";

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from "next/cache";
import { logLeadActivity } from "./crm";

export async function toggleShortlist(leadId: string, universityId: string, courseId?: string) {
  const supabase = await createClient()

  // 1. Check if already exists in applications (with SHORTLISTED status)
  const { data: existing } = await supabase
    .from('applications')
    .select('id, status')
    .eq('lead_id', leadId)
    .eq('university_id', universityId)
    .single()

  if (existing) {
    if (existing.status === 'SHORTLISTED') {
      // Remove from shortlist
      await supabase.from('applications').delete().eq('id', existing.id)
      await logLeadActivity({
        leadId,
        type: 'SYSTEM',
        description: `Removed university from shortlist`,
        counselorId: 'SYSTEM',
        metadata: { university_id: universityId }
      })
    }
  } else {
    // Add to shortlist
    const { data: app, error } = await supabase
      .from('applications')
      .insert([{
        lead_id: leadId,
        university_id: universityId,
        course_id: courseId,
        status: 'SHORTLISTED'
      }])
      .select()
      .single()

    if (!error) {
      await logLeadActivity({
        leadId,
        type: 'SYSTEM',
        description: `Added university to shortlist`,
        counselorId: 'SYSTEM',
        metadata: { university_id: universityId, application_id: app.id }
      })
    }
  }

  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true }
}

export async function updateApplicationFinancials(applicationId: string, data: {
  scholarshipAmount?: number;
  targetSalary?: number;
  livingCost?: number;
}) {
  const supabase = await createClient()

  const { data: app, error } = await supabase
    .from('applications')
    .update({
      scholarship_amount: data.scholarshipAmount,
      target_salary: data.targetSalary,
      living_cost: data.livingCost
    })
    .eq('id', applicationId)
    .select('lead_id')
    .single()

  if (error) {
    console.error("Error updating financials:", error)
    return { error: "Failed to update financial data" }
  }

  if (app) {
    revalidatePath(`/admin/leads/${app.lead_id}`)
  }
  
  return { success: true }
}
