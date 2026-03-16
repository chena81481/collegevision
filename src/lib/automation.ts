import { createAdminClient } from "@/utils/supabase/admin";
import { LeadStatus, ActivityType, LeadStatusType } from "@/lib/constants";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function triggerLeadAutomation(leadId: string, newStatus: LeadStatusType) {
  try {
    const supabase = createAdminClient();
    
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*, ownerCounselorId')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) return;

    // 1. Log Status Change Activity
    await supabase.from('activities').insert({
      leadId,
      type: ActivityType.STATUS_CHANGED,
      description: `Status changed to ${newStatus.replace('_', ' ')}`,
      counselorId: lead.ownerCounselorId
    });

    // 2. Automated Task Creation
    if (newStatus === LeadStatus.PROPOSAL) {
      await supabase.from('tasks').insert({
        title: "Follow up on Proposal",
        description: `Call ${lead.name} to confirm receipt of the proposal.`,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
        leadId,
        counselorId: lead.ownerCounselorId || 'system' 
      });

      await supabase.from('notifications').insert({
        title: "New Follow-up Task",
        message: `A follow-up task has been created for ${lead.name}.`,
        counselorId: lead.ownerCounselorId || 'system'
      });
    }

    // 3. Automated Emails (Resend)
    if (newStatus === LeadStatus.WON) {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'CollegeVision <admissions@collegevision.in>',
          to: [lead.email],
          subject: '🎉 Congratulations on your Admission!',
          html: `<p>Hi ${lead.name},</p><p>We are thrilled to inform you that your admission process is complete. We'll be in touch soon with next steps!</p>`
        });
      }

      await supabase.from('notifications').insert({
        title: "Lead Won! 🏆",
        message: `${lead.name} has officially joined! Enrollment confirmation sent.`,
        counselorId: lead.ownerCounselorId || 'system'
      });
    }

  } catch (error) {
    console.error("Automation error:", error);
  }
}
