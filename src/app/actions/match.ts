'use server'

import { createClient } from '@/utils/supabase/server';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { MatcherSchema, MatcherInput } from '@/utils/matcher';

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ''
  ).trim();
}

const genAI = new GoogleGenerativeAI(getGeminiApiKey());

export const runtime = 'edge'; // Edge Runtime for sub-second responses

export async function findVectorMatches(rawInput: MatcherInput) {
  try {
    // 1. Validate Input
    const validatedInput = MatcherSchema.parse(rawInput);
    
    // 2. Generate Embedding for User Query
    // We combine budget, timeline, and goals into a descriptive string
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const queryText = `Student with budget of ₹${validatedInput.budget}, interested in ${validatedInput.targetLevel || 'degrees'}, 
                      with focus on ${validatedInput.skills.join(', ')}. Career goal: ${validatedInput.statePreference || 'Better ROI'}`;
    
    const embeddingResult = await model.embedContent(queryText);
    const embedding = embeddingResult.embedding.values;

    const supabase = await createClient();

    // 3. Query Supabase RPC for Similarity Search
    const { data: matches, error: rpcError } = await supabase.rpc('match_programs', {
      query_embedding: embedding,
      match_threshold: 0.5, // 50% similarity threshold
      match_count: 5,
      min_salary: 0,
      max_fee: validatedInput.budget * 1.5 // Allow slight stretch
    });

    if (rpcError) throw rpcError;

    // 4. Return results structured for streaming (or await if simple)
    // For now, we return the list. Streaming will be handled in the component.
    return {
      success: true,
      matches: matches.map((m: any) => ({
        courseId: m.id,
        universityName: m.university_name,
        courseName: m.name,
        totalFee: m.total_fee_inr,
        avgCtc: m.avg_ctc_inr,
        roiScore: Number((m.avg_ctc_inr / m.total_fee_inr).toFixed(2)),
        matchScore: Math.round(m.similarity * 100),
        matchInsights: [] // Placeholder for AI-generated insights
      }))
    };

  } catch (err: any) {
    console.error("Vector match failed:", err);
    return { success: false, error: err.message };
  }
}
