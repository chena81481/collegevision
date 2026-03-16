import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "./prisma";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function generateLeadScore(leadId: string) {
  try {
    const lead = await (prisma as any).lead.findUnique({
      where: { id: leadId },
      include: {
        notes: { orderBy: { createdAt: 'desc' }, take: 5 },
        activities: { orderBy: { createdAt: 'desc' }, take: 10 },
        university: true,
      }
    });

    if (!lead) throw new Error("Lead not found");

    const context = `
      Lead Name: ${lead.name}
      Current Status: ${lead.status}
      Source: ${lead.source}
      Priority: ${lead.priority}
      Target University: ${lead.university?.name || "None"}
      
      Recent Notes:
      ${lead.notes.map((n: any) => `- ${n.content}`).join("\n")}
      
      Recent Activities:
      ${lead.activities.map((a: any) => `- ${a.description}`).join("\n")}
    `;

    const prompt = `
      As an expert education consultant, analyze this student lead and provide:
      1. A "Propensity Score" (0-100) representing how likely they are to enroll.
      2. 3 short, actionable "Insights" for the counselor.
      3. An "Admission Probability" (0-100) for their target university.
      
      Lead Context:
      ${context}
      
      Return ONLY a JSON object with this structure:
      {
        "score": number,
        "insights": string[],
        "admissionProbability": number
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown formatting
    const jsonStr = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(jsonStr);

    // Update lead with AI results
    // We append the probability to the insights JSON to avoid schema changes for a single field
    const enrichedInsights = {
      bullets: data.insights,
      admissionProbability: data.admissionProbability
    };

    await (prisma as any).lead.update({
      where: { id: leadId },
      data: {
        aiScore: data.score,
        aiInsights: JSON.stringify(enrichedInsights)
      }
    });

    return data;
  } catch (error) {
    console.error("AI Scoring Error:", error);
    return null;
  }
}
