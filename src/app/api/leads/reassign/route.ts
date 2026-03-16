import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

    const supabase = createAdminClient();

    // Verify counselor exists
    const { data: targetCounselor, error: counselorError } = await supabase
      .from('counselors')
      .select('name')
      .eq('id', targetCounselorId)
      .single();

    if (counselorError || !targetCounselor) {
      return NextResponse.json({ error: "Target counselor not found" }, { status: 404 });
    }

    // Bulk update leads
    const { data: updateResult, error: updateError, count } = await supabase
      .from('leads')
      .update({ ownerCounselorId: targetCounselorId })
      .in('id', leadIds);

    if (updateError) throw updateError;

    // Log the bulk activity
    const activities = leadIds.map(leadId => ({
      leadId,
      counselorId: user.id, // Admin who did the reassigning
      type: "ASSIGNED",
      description: `Bulk reassigned to ${targetCounselor.name} by Admin`
    }));

    const { error: activityError } = await supabase.from('activities').insert(activities);
    if (activityError) throw activityError;

    return NextResponse.json({ 
      success: true, 
      count: leadIds.length,
      message: `Successfully reassigned ${leadIds.length} leads to ${targetCounselor.name}`
    });
  } catch (error) {
    console.error("Lead Reassignment Error:", error);
    return NextResponse.json({ error: "Failed to reassign leads" }, { status: 500 });
  }
}
