import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const counselorId = searchParams.get("counselorId");

  if (!counselorId) return NextResponse.json({ error: "counselorId required" }, { status: 400 });

  try {
    const supabase = createAdminClient();
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('counselorId', counselorId)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();
    const { data: task, error } = await supabase
      .from('tasks')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
