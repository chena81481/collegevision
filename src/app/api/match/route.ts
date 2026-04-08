import { NextResponse } from "next/server";
import { getMatchesForQuery } from "@/lib/match-engine";

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    const authHeader = request.headers.get("Authorization") || "";
    const authToken = authHeader.replace("Bearer ", "").trim() || undefined;
    const { matches, parsedIntent } = await getMatchesForQuery(query, authToken);

    return NextResponse.json({
      success: true,
      parsedIntent,
      matches,
    });
  } catch (error) {
    console.error("[/api/match] Error:", error);
    return NextResponse.json({ error: "AI Matching Engine error" }, { status: 500 });
  }
}
