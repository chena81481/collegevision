import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
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

    const supabase = createAdminClient();
    const { data: milestones, error } = await supabase
      .from('application_milestones')
      .select('*')
      .eq('leadId', id)
      .order('createdAt', { ascending: true });

    if (error) throw error;
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

    const supabase = createAdminClient();
    const { data: milestone, error: mileError } = await supabase
      .from('application_milestones')
      .insert({
        title,
        status,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        leadId: id
      })
      .select()
      .single();

    if (mileError) throw mileError;

    // Log activity
    await supabase.from('activities').insert({
      type: "STATUS_CHANGED",
      description: `New application milestone: ${title} (${status})`,
      leadId: id,
      counselorId: activeCounselorId
    });

    return NextResponse.json(milestone, { status: 201 });
  } catch (error) {
    console.error("Error creating milestone:", error);
    return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
  }
}
