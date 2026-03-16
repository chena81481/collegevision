import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

    const supabase = createAdminClient();

    const { data: oldLead, error: fetchError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !oldLead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    const { data: updatedLead, error: updateError } = await supabase
      .from('leads')
      .update({ 
        status: status || oldLead.status, 
        priority: priority || oldLead.priority,
        ownerCounselorId: counselorId || oldLead.ownerCounselorId
      })
      .eq('id', id)
      .select(`
        *,
        university:universities ( * ),
        ownerCounselor:counselors ( * )
      `)
      .single();

    if (updateError) throw updateError;

    // Trigger Automation if status changed
    if (status && status !== oldLead.status) {
      await triggerLeadAutomation(id, status as any);
    }

    // Map to structure expected by frontend (Prisma style)
    const formattedLead = {
      ...updatedLead,
      university: updatedLead.university,
      ownerCounselor: updatedLead.ownerCounselor
    };

    return NextResponse.json(formattedLead);
  } catch (error) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
