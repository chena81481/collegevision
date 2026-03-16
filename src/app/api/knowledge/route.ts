import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";

    const supabase = createAdminClient();
    let queryBuilder = supabase
      .from('knowledge_base_resources')
      .select('*, university:universities(*)');

    if (search) {
      queryBuilder = queryBuilder.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    if (category) {
      queryBuilder = queryBuilder.eq('category', category);
    }

    const { data: resources, error } = await queryBuilder.order('updatedAt', { ascending: false });

    if (error) throw error;
    return NextResponse.json(resources);
  } catch (error) {
    console.error("KnowledgeBase GET Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category, universityId } = body;

    if (!title || !content || !category) {
      return NextResponse.json({ error: "Title, content, and category are required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data: resource, error } = await supabase
      .from('knowledge_base_resources')
      .insert({
        title,
        content,
        category,
        universityId: universityId || null
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error("KnowledgeBase POST Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
