import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { read } = await request.json();
    const supabase = createAdminClient();
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
