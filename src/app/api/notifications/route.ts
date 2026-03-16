import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const counselorId = searchParams.get("counselorId");

  if (!counselorId) return NextResponse.json({ error: "counselorId required" }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('counselorId', counselorId)
      .order('createdAt', { ascending: false })
      .limit(20);

    if (error) throw error;
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
