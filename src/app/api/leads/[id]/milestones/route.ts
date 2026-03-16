import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { canAccessLead } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activeCounselorId = "c1";
    
    if (!(await canAccessLead(activeCounselorId, id))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const milestones = await prisma.applicationMilestone.findMany({
      where: { leadId: id },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(milestones);
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activeCounselorId = "c1";
    
    if (!(await canAccessLead(activeCounselorId, id))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { title, status, date } = body;

    const milestone = await prisma.applicationMilestone.create({
      data: {
        title,
        status,
        date: date ? new Date(date) : new Date(),
        leadId: id
      }
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: "STATUS_CHANGED",
        description: `New application milestone: ${title} (${status})`,
        leadId: id,
        counselorId: activeCounselorId
      }
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}
