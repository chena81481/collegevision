import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import { calculateROI } from '@/lib/roi-calculator';

// ─── Clients ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // Server-side key — never exposed to browser
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// ─── Types ───────────────────────────────────────────────────────────────────
interface ParsedIntent {
  degreeType: string | null;
  maxBudgetINR: number | null;
  needsEMI: boolean;
  requiredApproval: string | null;
}

// ─── Route Handler ───────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    // ───────────────────────────────────────────────────────────────────────
    // STEP 1: Gemini NLP Parsing
    // ───────────────────────────────────────────────────────────────────────
    const prompt = `
You are an expert educational counselor system.
Extract the specific requirements from the user's query and output ONLY a valid JSON object — no markdown, no explanation.

User Query: "${query.trim()}"

Required JSON format:
{
  "degreeType": string | null,          // e.g. "MBA", "MCA", "BBA", "BCA", or null
  "maxBudgetINR": number | null,        // e.g. if they say "under 2 Lakhs" → 200000
  "needsEMI": boolean,                  // true if they mention EMI / installments / monthly payment
  "requiredApproval": string | null     // e.g. "NAAC A+", "UGC-DEB", or null
}
    `.trim();

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // Strip any accidental markdown code fences from Gemini's response
    const rawText = (aiResponse.text ?? '{}')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsedIntent: ParsedIntent = {
      degreeType: null,
      maxBudgetINR: null,
      needsEMI: false,
      requiredApproval: null,
    };

    try {
      parsedIntent = JSON.parse(rawText);
    } catch {
      console.warn('[/api/match] Gemini returned non-JSON, falling back to defaults:', rawText);
    }

    console.log('[/api/match] AI Parsed Intent:', parsedIntent);

    // ───────────────────────────────────────────────────────────────────────
    // STEP 2: Supabase query with dynamic filters
    // ───────────────────────────────────────────────────────────────────────
    let dbQuery = supabase
      .from('courses')
      .select(`
        *,
        universities (
          name,
          slug,
          logo_url,
          gradient_start,
          gradient_end,
          is_premium
        )
      `)
      .order('avg_ctc_inr', { ascending: false });

    if (parsedIntent.degreeType) {
      dbQuery = dbQuery.ilike('name', `%${parsedIntent.degreeType}%`);
    }

    if (parsedIntent.maxBudgetINR) {
      dbQuery = dbQuery.lte('total_fee_inr', parsedIntent.maxBudgetINR);
    }

    if (parsedIntent.needsEMI === true) {
      dbQuery = dbQuery.eq('has_zero_cost_emi', true);
    }

    if (parsedIntent.requiredApproval) {
      dbQuery = dbQuery.contains('approvals', [parsedIntent.requiredApproval]);
    }

    const { data: rawMatches, error: dbError } = await dbQuery.limit(6);

    if (dbError) {
      console.error('[/api/match] Supabase error:', dbError);
      throw new Error('Failed to fetch matching courses.');
    }

    // ───────────────────────────────────────────────────────────────────────
    // STEP 3: Enrich with dynamic ROI & return
    // ───────────────────────────────────────────────────────────────────────
    const matches = (rawMatches ?? []).map((course) => ({
      ...course,
      universityName: course.universities?.name ?? 'Unknown',
      universitySlug: course.universities?.slug ?? '',
      logoUrl: course.universities?.logo_url ?? null,
      gradientStart: course.universities?.gradient_start ?? 'from-slate-50',
      gradientEnd: course.universities?.gradient_end ?? 'to-white',
      roi: calculateTrueROI(course.total_fee_inr, course.avg_ctc_inr ?? 0, course.duration_months),
    }));

    return NextResponse.json({
      success: true,
      parsedIntent,
      matches,
    });

  } catch (err) {
    console.error('[/api/match] Error:', err);
    return NextResponse.json(
      { error: 'Our AI counselor is currently busy. Please try again.' },
      { status: 500 }
    );
  }
}
