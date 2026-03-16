import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCounselor, canAccessLead } from "@/lib/auth";

// Create or update application
export async function POST(request: NextRequest) {
  try {
    const counselorId = "c1"; // Mock session
    const body = await request.json();
    const { leadId, universityId, status, scholarshipAmount, tuitionFee, livingCost, notes } = body;

    if (!leadId || !universityId) {
      return NextResponse.json({ error: "Lead and University ID are required" }, { status: 400 });
    }

    // Auth check
    const hasAccess = await canAccessLead(counselorId, leadId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const application = await prisma.application.upsert({
      where: {
        leadId_universityId: { leadId, universityId }
      },
      update: {
        status,
        scholarshipAmount,
        tuitionFee,
        livingCost,
        notes
      },
      create: {
        leadId,
        universityId,
        status,
        scholarshipAmount,
        tuitionFee,
        livingCost,
        notes
      }
    });

    // Log Activity
    await prisma.activity.create({
      data: {
        leadId,
        counselorId,
        type: "UPDATED",
        description: `Application status for ${universityId} updated to ${status}`
      }
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Application API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get all applications for a lead
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const leadId = searchParams.get("leadId");

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const applications = await prisma.application.findMany({
      where: { leadId },
      include: { university: true }
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Application GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
