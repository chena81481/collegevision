import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { canAccessLead } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activeCounselorId = "c1"; // Placeholder
    
    if (!(await canAccessLead(activeCounselorId, id))) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const supabase = createAdminClient();
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('leadId', id)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
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
    const { name, type, url } = body;

    const supabase = createAdminClient();
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        name,
        type,
        url,
        leadId: id
      })
      .select()
      .single();

    if (docError) throw docError;

    // Log activity
    await supabase.from('activities').insert({
      type: "UPDATED",
      description: `Uploaded document: ${name} (${type})`,
      leadId: id,
      counselorId: activeCounselorId
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
