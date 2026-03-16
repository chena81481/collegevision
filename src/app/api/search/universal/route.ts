import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) {
      return NextResponse.json({ leads: [], universities: [], knowledge: [] });
    }

    const supabase = createAdminClient();

    const [
      { data: leads },
      { data: universities },
      { data: knowledge }
    ] = await Promise.all([
      supabase.from('leads')
        .select('id, name, email, status')
        .or(`name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
        .limit(5),
      supabase.from('universities')
        .select('id, name, location, country')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(5),
      supabase.from('knowledge_base_resources')
        .select('id, title, category')
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .limit(5)
    ]);

    return NextResponse.json({
      leads: leads || [],
      universities: universities || [],
      knowledge: knowledge || [],
    });
  } catch (error) {
    console.error("Universal Search Error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
