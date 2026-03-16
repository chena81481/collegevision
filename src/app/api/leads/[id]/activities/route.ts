import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, description, counselorId } = body;

    if (!type || !description) {
      return NextResponse.json(
        { error: "Type and description are required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data: activity, error } = await supabase
      .from('activities')
      .insert({
        type: type as any,
        description,
        leadId: id,
        counselorId: counselorId || null,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
