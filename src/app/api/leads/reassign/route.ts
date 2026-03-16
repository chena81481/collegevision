import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCounselor, isAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const adminId = "c1"; // Mock admin session
    const user = await getCounselor(adminId);
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }

    const { leadIds, targetCounselorId } = await req.json();

    if (!leadIds || !Array.isArray(leadIds) || !targetCounselorId) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    // Verify counselor exists
    const targetCounselor = await prisma.counselor.findUnique({
      where: { id: targetCounselorId }
    });

    if (!targetCounselor) {
      return NextResponse.json({ error: "Target counselor not found" }, { status: 404 });
    }

    // Bulk update leads
    const updateResult = await prisma.lead.updateMany({
      where: {
        id: { in: leadIds }
      },
      data: {
        ownerCounselorId: targetCounselorId
      }
    });

    // Log the bulk activity (we'll just log one activity per lead or a summarized one if we had a BulkActivity model)
    // For now, let's create individual activities for tracking
    const activityPromises = leadIds.map(leadId => 
      prisma.activity.create({
        data: {
          leadId,
          counselorId: user.id, // Admin who did the reassigning
          type: "ASSIGNED",
          description: `Bulk reassigned to ${targetCounselor.name} by Admin`
        }
      })
    );

    await Promise.all(activityPromises);

    return NextResponse.json({ 
      success: true, 
      count: updateResult.count,
      message: `Successfully reassigned ${updateResult.count} leads to ${targetCounselor.name}`
    });
  } catch (error) {
    console.error("Lead Reassignment Error:", error);
    return NextResponse.json({ error: "Failed to reassign leads" }, { status: 500 });
  }
}
