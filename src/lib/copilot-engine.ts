import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export interface CopilotContext {
  leadId?: string;
  universityId?: string;
  query: string;
}

export async function askCopilot({ leadId, universityId, query }: CopilotContext) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Fetch Lead Context
    let leadContext = "";
    if (leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { notes: true, activities: true, university: true }
      });
      if (lead) {
        leadContext = `
          Student Name: ${lead.name}
          Target University: ${lead.university?.name || "None"}
          Current Status: ${lead.status}
          Recent Notes: ${lead.notes.map((n: any) => n.content).join("; ")}
        `;
      }
    }

    // Fetch Knowledge Base Context
    const resources = await prisma.knowledgeBaseResource.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          universityId ? { universityId } : {}
        ]
      },
      take: 3
    });

    const knowledgeContext = resources.map(r => `[Resource: ${r.title}] ${r.content}`).join("\n\n");

    const prompt = `
      You are the "CollegeVision AI Copilot", a specialized assistant for education counselors.
      Your goal is to provide accurate, helpful, and professional advice based on provided context.

      ### STUDENT CONTEXT:
      ${leadContext || "No specific student selected."}

      ### INTERNAL KNOWLEDGE BASE:
      ${knowledgeContext || "No specific guides found. Use general knowledge but state if it's not from internal resources."}

      ### COUNSELOR QUERY:
      ${query}

      ### GUIDELINES:
      - If drafting an email, use a professional but friendly tone.
      - If answering a visa/admission question, be precise and cite the internal resource title if used.
      - Do not make up facts about universities not in the context.
      - Keep responses concise and formatted with markdown.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Copilot Engine Error:", error);
    throw new Error("Failed to generate AI response.");
  }
}
