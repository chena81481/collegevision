"use server";

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from "next/cache";
import { Resend } from 'resend';
import { Twilio } from 'twilio';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// --- LEADS ---

export async function updateLeadStatus(leadId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .update({ status: newStatus })
    .eq('id', leadId)

  if (error) {
    console.error("Failed to update status:", error)
    return { error: "Failed to update status" }
  }

  revalidatePath('/admin/pipeline')
  return { success: true }
}

// --- DEALS ---

export async function fetchDeals() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("deals")
    .select(`
      *,
      contacts (first_name, last_name, phone, email),
      companies (name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching deals:", error);
    return [];
  }
  return data;
}

export async function updateDealStage(dealId: string, newStage: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("deals")
    .update({ stage: newStage })
    .eq("id", dealId);

  if (error) {
    console.error("Error updating deal stage:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/pipeline");
  return data;
}

export async function createDeal(deal: any) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("deals")
    .insert([deal])
    .select();

  if (error) {
    console.error("Error creating deal:", error);
    throw new Error(error.message);
  }

  revalidatePath("/admin/pipeline");
  return data;
}

// --- CONTACTS ---

export async function fetchContacts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("contacts")
    .select(`
      *,
      companies (name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching contacts:", error);
    return [];
  }
  return data;
}

export async function fetchContactDetails(contactId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("contacts")
    .select(`
      *,
      companies (*),
      deals (*),
      activities (*)
    `)
    .eq("id", contactId)
    .single();

  if (error) {
    console.error("Error fetching contact details:", error);
    return null;
  }
  return data;
}

// --- ACTIVITIES ---

export async function createActivity(activity: {
  deal_id?: string;
  contact_id: string;
  type: string;
  description: string;
}) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("activities")
    .insert([activity])
    .select();

  if (error) {
    console.error("Error logging activity:", error);
    throw new Error(error.message);
  }

  // Revalidate both pipeline and details if applicable
  revalidatePath("/admin/pipeline");
  revalidatePath(`/admin/contacts/${activity.contact_id}`);
  return data;
}

export async function sendEmail({ contactId, to, subject, body }: { contactId: string, to: string, subject: string, body: string }) {
  if (!resend) throw new Error("Resend API key missing");

  const { data, error } = await resend.emails.send({
    from: 'CollegeVision <counselor@collegevision.in>',
    to: [to],
    subject: subject,
    html: body,
  });

  if (error) {
    console.error("Resend error:", error);
    throw new Error("Failed to send email");
  }

  // Log Activity
  await createActivity({
    contact_id: contactId,
    type: 'Email',
    description: `Sent Email: ${subject}`,
  });

  return data;
}

export async function sendSMS({ contactId, to, message }: { contactId: string, to: string, message: string }) {
  if (!twilioClient) throw new Error("Twilio credentials missing");

  try {
    const response = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });

    // Log Activity
    await createActivity({
      contact_id: contactId,
      type: 'Call',
      description: `Sent SMS: ${message}`,
    });

    return response;
  } catch (error) {
    console.error("Twilio error:", error);
    throw new Error("Failed to send SMS");
  }
}

// --- COMPANIES ---

export async function fetchCompanies() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching companies:", error);
    return [];
  }
  return data;
}
// --- LEAD ACTIVITIES (v2) ---

export async function logLeadActivity(activity: {
  leadId: string;
  type: string;
  description: string;
  counselorId: string;
  metadata?: any;
}) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('lead_activities')
    .insert([{
      lead_id: activity.leadId,
      type: activity.type,
      description: activity.description,
      counselor_id: activity.counselorId,
      metadata: activity.metadata || {}
    }])
    .select()
    .single()

  if (error) {
    console.error("Error logging lead activity:", error)
    return { error: "Failed to log activity" }
  }

  revalidatePath(`/admin/leads/${activity.leadId}`)
  return { success: true, activity: data }
}

export async function addLeadNote(leadId: string, content: string, counselorId: string) {
  const supabase = await createClient()
  
  // 1. Insert into notes table (for specialized note features like mentions)
  const { data: note, error: noteError } = await supabase
    .from('notes')
    .insert([{
      lead_id: leadId,
      content: content,
      counselor_id: counselorId
    }])
    .select()
    .single()

  if (noteError) {
    console.error("Error adding note:", noteError)
    return { error: "Failed to add note" }
  }

  // 2. Also log as an activity for the unified feed
  await logLeadActivity({
    leadId,
    type: 'NOTE',
    description: content,
    counselorId,
    metadata: { note_id: note.id }
  })

  revalidatePath(`/admin/leads/${leadId}`)
  return { success: true, note }
}

export async function reassignLead(leadId: string, counselorId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('leads')
    .update({ owner_counselor_id: counselorId })
    .eq('id', leadId)

  if (error) {
    console.error("Error reassigning lead:", error)
    return { error: "Failed to reassign lead" }
  }

  await logLeadActivity({
    leadId,
    type: 'ASSIGNED',
    description: `Lead reassigned to counselor ${counselorId}`,
    counselorId: 'SYSTEM',
    metadata: { new_counselor_id: counselorId }
  })

  revalidatePath(`/admin/leads/${leadId}`)
  revalidatePath('/admin/pipeline')
  return { success: true }
}
