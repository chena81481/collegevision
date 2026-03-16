import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { triggerLeadAutomation } from "@/lib/automation";
import { canAccessLead } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // RBAC check
    const activeCounselorId = "c1"; // Assume logged in counselor
    const hasAccess = await canAccessLead(activeCounselorId, id);
    if (!hasAccess) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { status, priority, counselorId } = body;

    const oldLead = await prisma.lead.findUnique({ where: { id } });
    if (!oldLead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: { 
        status: status || oldLead.status, 
        priority: priority || oldLead.priority,
        ownerCounselorId: counselorId || oldLead.ownerCounselorId
      },
      include: {
        university: true,
        ownerCounselor: true
      }
    });

    // Trigger Automation if status changed
    if (status && status !== oldLead.status) {
      await triggerLeadAutomation(id, status);
    }

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
