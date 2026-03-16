import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, counselorId } = body;

    if (!content || !counselorId) {
      return NextResponse.json(
        { error: "Content and counselorId are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: note, error: noteError } = await supabase
      .from('notes')
      .insert({
        content,
        leadId: id,
        counselorId,
      })
      .select('*, counselor:counselors(*)')
      .single();

    if (noteError) throw noteError;

    // Also log this as an activity
    await supabase.from('activities').insert({
      type: "NOTE_ADDED",
      description: "Added a new counselor note",
      leadId: id,
      counselorId,
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
