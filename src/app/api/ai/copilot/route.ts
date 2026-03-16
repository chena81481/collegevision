import { NextRequest, NextResponse } from "next/server";
import { askCopilot } from "@/lib/copilot-engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadId, universityId, query } = body;

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const response = await askCopilot({ leadId, universityId, query });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Copilot API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response" }, { status: 500 });
  }
}
