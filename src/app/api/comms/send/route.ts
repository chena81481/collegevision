import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { getCounselor } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const counselorId = "c1"; // Mock session
    const body = await request.json();
    const { leadId, type, content } = body;

    if (!leadId || !type || !content) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { ownerCounselor: true }
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // 1. Send the communication
    if (type === "EMAIL") {
      await resend.emails.send({
        from: 'CollegeVision <admissions@collegevision.in>',
        to: [lead.email],
        subject: `Update regarding your application - ${lead.name}`,
        html: `<p>${content.replace(/\n/g, '<br>')}</p>`
      });
    } else if (type === "WHATSAPP") {
      // Mock WhatsApp send logic (would use Twilio here)
      console.log(`[WhatsApp Mock] Sending to ${lead.phone}: ${content}`);
    }

    // 2. Log Activity
    await prisma.activity.create({
      data: {
        leadId,
        counselorId,
        type: "CONTACTED",
        description: `Sent specialized ${type}: ${content.substring(0, 50)}...`
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Comms API Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
