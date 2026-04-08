'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { Resend } from 'resend'
import twilio from 'twilio'
import { syncStudentProfile, trackStudentActivity } from '@/lib/student-journey'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

type LeadSubmissionStatus = "FULL" | "PARTIAL" | "FAILED";

interface LeadSubmissionResult {
  success?: boolean;
  status?: LeadSubmissionStatus;
  leadId?: string;
  legacyLeadId?: string;
  message?: string;
  error?: string;
  storage?: {
    legacyLeadSaved: boolean;
    crmLeadSaved: boolean;
    activityLogged: boolean;
  };
}

async function logLeadActivityCompat(
  adminSupabase: ReturnType<typeof createAdminClient>,
  leadId: string,
  description: string,
  metadata: Record<string, unknown>
) {
  const candidatePayloads = [
    { lead_id: leadId, type: 'NOTE', description, metadata },
    { lead_id: leadId, type: 'NOTE', description },
    { lead_id: leadId, activity_type: 'NOTE', description },
    { lead_id: leadId, description },
    { description },
  ];

  let lastError: any = null;

  for (const payload of candidatePayloads) {
    const { error } = await adminSupabase.from('lead_activities').insert([payload]);
    if (!error) {
      return { success: true as const };
    }
    lastError = error;
  }

  return {
    success: false as const,
    error: lastError,
  };
}

export async function submitApplicationLead(input: FormData | any): Promise<LeadSubmissionResult> {
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

  const adminSupabase = createAdminClient();
  let user = null;

  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (authError) {
    console.warn("Lead submission proceeding without request-scoped auth user:", authError);
  }

  try {
    // Verify Cloudflare Turnstile only when the backend secret is configured.
    if (process.env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        return {
          success: false,
          status: "FAILED",
          error: "Please complete the security check and try again.",
          storage: {
            legacyLeadSaved: false,
            crmLeadSaved: false,
            activityLogged: false,
          },
        };
      }

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
        return {
          success: false,
          status: "FAILED",
          error: "Security check failed. Please refresh the page and try again.",
          storage: {
            legacyLeadSaved: false,
            crmLeadSaved: false,
            activityLogged: false,
          },
        };
      }
    }

    // 1. Save to Legacy Lead Table using the actual schema columns
    const { data: legacyLead, error: legacyError } = await adminSupabase
      .from('user_leads')
      .insert([{ 
        user_id: user?.id ?? null,
        phone_number: phone, 
        target_degree: courseName, 
        status: 'New Lead', 
        email: studentEmail,
        search_query: `${courseName} | ${universityName} | ${state}`
      }])
      .select().single()

    if (legacyError) {
      console.error("Legacy lead save failed:", legacyError)
    }

    // 2. Save to the main CRM lead table through the admin client
    const { data: mainLead, error: mainError } = await adminSupabase
      .from('leads')
      .insert([{
        name: studentNameRaw,
        email: studentEmail,
        phone: phone,
        course_interest: courseName,
        status: 'NEW_LEAD',
        source: 'WEBSITE',
        notes: `Interest in ${universityName} for ${courseName}. State: ${state}. Captured from website form.`
      }])
      .select().single()

    if (mainError) {
      console.error("CRM Lead save failed:", mainError)
    }

    if (!mainLead && !legacyLead) {
      throw new Error("Lead could not be stored in Supabase.")
    }

    // 3. Log initial interaction in the unified activity table when available
    let activityLogged = false;
    if (mainLead) {
      const activityDescription = `Lead auto-captured for ${courseName} at ${universityName}. Student location: ${state}. Initial counselor eligibility review pending.`;
      const activityResult = await logLeadActivityCompat(
        adminSupabase,
        mainLead.id,
        activityDescription,
        {
          source: 'website_form',
          state,
          university_name: universityName,
          course_name: courseName,
        }
      );

      if (!activityResult.success) {
        console.error("Lead activity log failed:", activityResult.error)
      } else {
        activityLogged = true;
      }
    }

    await trackStudentActivity({
      user,
      eventType: 'FORM',
      eventName: 'APPLICATION_LEAD_SUBMITTED',
      pagePath: '/universities',
      metadata: {
        lead_id: mainLead?.id || legacyLead?.id,
        university_name: universityName,
        course_name: courseName,
        state,
      },
    })

    await syncStudentProfile({
      user,
      source: 'APPLICATION',
      profile: {
        full_name: studentNameRaw,
        email: studentEmail,
        phone_number: phone,
        preferred_degree: courseName,
        state,
      },
    })

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

    const storage = {
      legacyLeadSaved: Boolean(legacyLead),
      crmLeadSaved: Boolean(mainLead),
      activityLogged,
    };

    return { 
      success: true,
      status: storage.legacyLeadSaved && storage.crmLeadSaved ? "FULL" : "PARTIAL",
      leadId: mainLead?.id || legacyLead?.id,
      legacyLeadId: legacyLead?.id,
      message:
        storage.legacyLeadSaved && storage.crmLeadSaved
          ? "Your details were saved successfully and our team can now follow up."
          : "Your request was captured, but part of the CRM sync needs a retry from our side.",
      storage,
    }

  } catch (error: any) {
    console.error("Critical submission failed:", error)
    return {
      success: false,
      status: "FAILED",
      error: error?.message || "Submission encountered an error. Our team has been notified.",
      storage: {
        legacyLeadSaved: false,
        crmLeadSaved: false,
        activityLogged: false,
      },
    }
  }
}
