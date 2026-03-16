import { NextRequest, NextResponse } from "next/server";
import { generateLeadScore } from "@/lib/ai-scoring";
import { getCounselor, canAccessLead } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadId = params.id;
    const adminId = "c1"; // Mock session
    
    // Auth check
    const hasAccess = await canAccessLead(adminId, leadId);
    if (!hasAccess) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const result = await generateLeadScore(leadId);

    if (!result) {
      return NextResponse.json({ error: "Failed to generate AI score" }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
