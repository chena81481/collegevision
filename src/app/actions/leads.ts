'use server'

import { createClient } from '@/utils/supabase/server'
import { Resend } from 'resend'
import twilio from 'twilio'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function submitApplicationLead(formData: FormData) {
  const phone = formData.get('phone') as string
  const courseName = formData.get('courseName') as string
  const universityName = formData.get('universityName') as string
  const studentNameRaw = formData.get('studentName') as string || 'there'
  const studentEmail = formData.get('email') as string
  
  const nameParts = studentNameRaw.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ')

  const supabase = await createClient()

  try {
    // 1. Save to Legacy Lead Table
    const { data: lead, error: leadError } = await supabase
      .from('user_leads')
      .insert([{ phone_number: phone, target_degree: courseName, status: 'New Lead', email: studentEmail }])
      .select().single()

    if (leadError) throw new Error(leadError.message)

    // 2. CREATE CRM RECORDS (The New System)
    
    // a. Create Contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert([{ 
        first_name: firstName, 
        last_name: lastName, 
        email: studentEmail, 
        phone: phone,
        job_title: 'Prospect'
      }])
      .select().single()

    if (!contactError && contact) {
      // b. Create Deal
      const { data: deal, error: dealError } = await supabase
        .from('deals')
        .insert([{
          contact_id: contact.id,
          name: `${courseName} - ${universityName}`,
          amount: 50000, // Placeholder or calculate based on course
          stage: 'Lead'
        }])
        .select().single()

      if (!dealError && deal) {
        // c. Log Initial Activity
        await supabase.from('activities').insert([{
          deal_id: deal.id,
          contact_id: contact.id,
          type: 'Note',
          description: `Lead captured from website for ${courseName} at ${universityName}`
        }])
      }
    }

    // 3. Fire Automated WhatsApp via Twilio
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

    // 4. Fire Automated Welcome Email via Resend
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

    return { success: true, leadId: lead.id }

  } catch (error: any) {
    console.error("Lead capture failed:", error)
    return { error: "Failed to submit application. Please try again." }
  }
}
