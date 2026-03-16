"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { Resend } from 'resend';
import { Twilio } from 'twilio';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// --- DEALS ---

export async function fetchDeals() {
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
