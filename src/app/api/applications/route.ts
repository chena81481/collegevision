import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { canAccessLead } from "@/lib/auth";

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

    const supabase = createAdminClient();
    const { data: application, error: upsertError } = await supabase
      .from('applications')
      .upsert({
        leadId,
        universityId,
        status,
        scholarshipAmount,
        tuitionFee,
        livingCost,
        notes
      }, { onConflict: 'leadId,universityId' })
      .select()
      .single();

    if (upsertError) throw upsertError;

    // Log Activity
    await supabase.from('activities').insert({
      leadId,
      counselorId,
      type: "UPDATED",
      description: `Application status for ${universityId} updated to ${status}`
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

    const supabase = createAdminClient();
    const { data: applications, error } = await supabase
      .from('applications')
      .select('*, university:universities(*)')
      .eq('leadId', leadId);

    if (error) throw error;
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Application GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
