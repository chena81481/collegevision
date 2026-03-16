import prisma from "@/lib/prisma";
import { LeadStatus, ActivityType } from "@prisma/client";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function triggerLeadAutomation(leadId: string, newStatus: LeadStatus) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { ownerCounselor: true }
    });

    if (!lead) return;

    // 1. Log Status Change Activity
    await prisma.activity.create({
      data: {
        leadId,
        type: ActivityType.STATUS_CHANGED,
        description: `Status changed to ${newStatus.replace('_', ' ')}`,
        counselorId: lead.ownerCounselorId
      }
    });

    // 2. Automated Task Creation
    if (newStatus === LeadStatus.PROPOSAL) {
      await prisma.task.create({
        data: {
          title: "Follow up on Proposal",
          description: `Call ${lead.name} to confirm receipt of the proposal.`,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          leadId,
          counselorId: lead.ownerCounselorId || 'system' 
        }
      });

      await prisma.notification.create({
        data: {
          title: "New Follow-up Task",
          message: `A follow-up task has been created for ${lead.name}.`,
          counselorId: lead.ownerCounselorId || 'system'
        }
      });
    }

    // 3. Automated Emails (Resend)
    if (newStatus === LeadStatus.WON) {
      await resend.emails.send({
        from: 'CollegeVision <admissions@collegevision.in>',
        to: [lead.email],
        subject: '🎉 Congratulations on your Admission!',
        html: `<p>Hi ${lead.name},</p><p>We are thrilled to inform you that your admission process is complete. We'll be in touch soon with next steps!</p>`
      });

      await prisma.notification.create({
        data: {
          title: "Lead Won! 🏆",
          message: `${lead.name} has officially joined! Enrollment confirmation sent.`,
          counselorId: lead.ownerCounselorId || 'system'
        }
      });
    }

  } catch (error) {
    console.error("Automation error:", error);
  }
}
