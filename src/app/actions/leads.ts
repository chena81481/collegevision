'use server'

import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'
import twilio from 'twilio'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function submitApplicationLead(input: FormData | any) {
  let phone, courseName, universityName, studentNameRaw, studentEmail, state, turnstileToken;

  if (input instanceof FormData) {
    phone = input.get('phone') as string;
    courseName = input.get('courseName') as string;
    universityName = input.get('universityName') as string;
    studentNameRaw = input.get('studentName') as string || 'there';
    studentEmail = input.get('email') as string;
    state = input.get('state') as string || 'Not specified';
    turnstileToken = input.get('cf-turnstile-response') as string;
  } else {
    phone = input.phone;
    courseName = input.courseName;
    universityName = input.universityName;
    studentNameRaw = input.name || input.studentName || 'there';
    studentEmail = input.email;
    state = input.state || 'Not specified';
    turnstileToken = input.turnstileToken;
  }

  const nameParts = studentNameRaw.split(' ');
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(' ');

  const supabase = await createClient();

  // 1. Verify Cloudflare Turnstile (Bot Protection)
  if (process.env.NODE_ENV === 'production' || process.env.TURNSTILE_SECRET_KEY) {
    if (!turnstileToken) throw new Error("Bot verification failed. Please try again.");
    
    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      throw new Error("Security check failed. Please refresh the page.");
    }
  }

  try {
    // 1. Save to Legacy Lead Table (Tracking/Session)
    const { data: legacyLead, error: legacyError } = await supabase
      .from('user_leads')
      .insert([{ 
        phone_number: phone, 
        target_degree: courseName, 
        status: 'New Lead', 
        email: studentEmail,
        state: state
      }])
      .select().single()

    // 2. SAVE TO MAIN CRM LEAD TABLE (Unified System)
    const { data: mainLead, error: mainError } = await supabase
      .from('leads')
      .insert([{
        name: studentNameRaw,
        email: studentEmail,
        phone: phone,
        course_interest: courseName,
        state: state,
        status: 'NEW_LEAD',
        crm_stage: 'NEW_LEAD',
        source: 'WEBSITE',
        notes: `Interest in ${universityName} for ${courseName}. Captured from website modal.`
      }])
      .select().single()

    if (mainError) {
      console.error("CRM Lead save failed:", mainError)
      // We don't throw yet, a successful legacy lead is better than nothing
    }

    // 3. LOG INITIAL INTERACTION
    if (mainLead) {
      await supabase.from('activities').insert([{
        lead_id: mainLead.id,
        type: 'Note',
        description: `Lead auto-captured for ${courseName} at ${universityName}. Student location: ${state}. Initial counselor eligibility review pending.`
      }])
    }

    // 4. Fire Automated WhatsApp via Twilio
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/[^0-9]/g, '')}`
    
    try {
      if (twilioClient) {
        await twilioClient.messages.create({
          body: `Hi ${firstName}! 🎓 Priya here from CollegeVision.\n\nI just received your profile for the *${courseName} at ${universityName}*. \n\nI'm reviewing your eligibility for the fee waiver now. When is a good time to call you today?`,
          from: 'whatsapp:+14155238886', 
          to: `whatsapp:${formattedPhone}`
        })
      }
    } catch (twilioErr) {
      console.error("Twilio WhatsApp failed:", twilioErr)
    }

    // 5. Fire Automated Welcome Email via Resend
    if (studentEmail && resend) {
      await resend.emails.send({
        from: 'Priya at CollegeVision <counseling@collegevision.com>',
        to: studentEmail,
        subject: `Your application for ${universityName} is initiated!`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Hi ${firstName},</h2>
            <p>I'm Priya, your dedicated CollegeVision counselor.</p>
            <p>I saw you just initiated an application for the <strong>${courseName} at ${universityName}</strong>. Great choice—it has one of the highest ROI metrics on our platform.</p>
            <p>To fast-track your application and secure your fee waiver, what is a good time to call you on ${phone}?</p>
            <br/>
            <p>Best regards,<br/><strong>Priya Desai</strong><br/>Senior Admissions Expert</p>
          </div>
        `
      })
    }

    return { 
      success: true, 
      leadId: mainLead?.id || legacyLead?.id,
      legacyLeadId: legacyLead?.id 
    }

  } catch (error: any) {
    console.error("Critical submission failed:", error)
    return { error: "Submission encountered an error. Our team has been notified." }
  }
}
