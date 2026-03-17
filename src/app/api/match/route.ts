import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateROI } from '@/lib/roi-calculator';

// ─── Clients ─────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // Server-side key — never exposed to browser
);

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ─── Types ───────────────────────────────────────────────────────────────────
interface ParsedIntent {
  degreeType: string | null;
  maxBudgetINR: number | null;
  needsEMI: boolean;
  requiredApproval: string | null;
}

// ─── Route Handler ───────────────────────────────────────────────────────────
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
Extract the specific requirements from the user's query and output ONLY a valid JSON object.

User Query: "${query.trim()}"

Required JSON format:
{
  "degreeType": string | null,          // e.g. "MBA", "MCA", "BBA", "BCA", or null
  "maxBudgetINR": number | null,        // e.g. if they say "under 2 Lakhs" → 200000
  "isStrictBudget": boolean,            // true if they say "strictly", "not more than", "cap"
  "needsEMI": boolean,                  // true if they mention EMI / installments / monthly payment
  "requiredApproval": string | null,    // e.g. "NAAC A+", "UGC-DEB", or null
  "careerGoal": string | null,          // e.g. "Product Manager", "Data Science", etc.
  "studentLevel": "Bachelors" | "Masters" | "Other", // e.g. "Masters" if they have graduation degree
  "admissionReadiness": "High" | "Medium" | "Low", // Predictive odds
  "confidenceScore": number             // 0-100 based on how clear the query intent is
}
    `.trim();

    const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text()
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let parsedIntent: any = {
      degreeType: null,
      maxBudgetINR: null,
      isStrictBudget: false,
      needsEMI: false,
      requiredApproval: null,
      careerGoal: null,
      studentLevel: 'Other',
      admissionReadiness: 'Medium',
      confidenceScore: 50,
    };

    try {
      parsedIntent = JSON.parse(rawText);
    } catch {
      console.warn('[/api/match] Gemini returned non-JSON, falling back to defaults');
    }

    // ───────────────────────────────────────────────────────────────────────
    // STEP 2: Fetch broad candidate set (Top 50)
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
      .limit(50);

    if (parsedIntent.degreeType) {
      dbQuery = dbQuery.ilike('name', `%${parsedIntent.degreeType}%`);
    }

    const { data: candidates, error: dbError } = await dbQuery;

    if (dbError || !candidates) {
      throw new Error('Failed to fetch candidates');
    }

    // ───────────────────────────────────────────────────────────────────────
    // STEP 3: Predictive Scoring & Strict Filtering
    // ───────────────────────────────────────────────────────────────────────
    const scoredMatches = candidates
      .filter(course => {
        // Strict Budget Enforcement (Deal-Breaker)
        if (parsedIntent.isStrictBudget && parsedIntent.maxBudgetINR) {
          return course.total_fee_inr <= parsedIntent.maxBudgetINR * 1.05; // 5% grace
        }
        return true;
      })
      .map(course => {
        let score = 0;

        // 1. Budget Fit (30%)
        if (parsedIntent.maxBudgetINR) {
          if (course.total_fee_inr <= parsedIntent.maxBudgetINR) {
            score += 30;
          } else if (course.total_fee_inr <= parsedIntent.maxBudgetINR * 1.2) {
            score += 15; 
          }
        } else {
          score += 20; 
        }

        // 2. Career Correlation (25%)
        const careerSectors: Record<string, string[]> = {
          "product manager": ["management", "business", "data", "digital marketing"],
          "data scientist": ["data science", "mca", "analytics"],
          "finance": ["mba finance", "m.com", "accounts"],
          "tech": ["mca", "bca", "computer science"]
        };

        const targetSectors = careerSectors[parsedIntent.careerGoal?.toLowerCase() || ''] || [];
        const isCareerMatch = targetSectors.some(s => course.name.toLowerCase().includes(s));
        
        if (isCareerMatch) {
          score += 25;
        } else if (parsedIntent.degreeType && course.name.toLowerCase().includes(parsedIntent.degreeType.toLowerCase())) {
          score += 15;
        }

        // 3. ROI Potential (20%)
        const roiResult = calculateROI(course.total_fee_inr, 0, 0, course.avg_ctc_inr ?? 0, (course.duration_months ?? 24) / 12);
        const roiValue = roiResult.totalReturnsFiveYears;
        if (roiValue > 1000000) score += 20; 
        else if (roiValue > 500000) score += 10;

        // 4. Approval Match (15%)
        if (parsedIntent.requiredApproval && course.approvals?.includes(parsedIntent.requiredApproval)) {
          score += 15;
        } else {
          score += 10;
        }

        // 5. EMI Bonus (10%)
        if (parsedIntent.needsEMI && course.has_zero_cost_emi) {
          score += 10;
        }

        // 6. Admissions Predictive Logic (Bonus)
        const admissionProbability = parsedIntent.admissionReadiness === 'High' ? 95 : parsedIntent.admissionReadiness === 'Medium' ? 70 : 45;
        const admissionConditions = [];
        if (parsedIntent.studentLevel === 'Masters' && course.degree_level === 'Masters') {
          admissionConditions.push("Requires 50%+ in Graduation");
        } else if (parsedIntent.studentLevel === 'Bachelors' && course.degree_level === 'Bachelors') {
          admissionConditions.push("Requires 12th Pass Marksheet");
        }

        // Adjust score based on NLP confidence
        const finalScore = Math.min(score * (parsedIntent.confidenceScore / 100) + (score * 0.2), 100);

        return {
          ...course,
          matchScore: Math.round(finalScore),
          confidenceScore: parsedIntent.confidenceScore,
          admissionProbability,
          admissionConditions,
          universityName: course.universities?.name,
          logoUrl: course.universities?.logo_url,
          roi: Math.round(roiValue / 10000), // Scaled for display
          category: course.category || "online-degrees",
          universitySlug: course.universities?.slug,
          matchReasons: [
            course.has_zero_cost_emi ? "Zero-Cost EMI Available" : null,
            roiValue > 1000000 ? "Exceptionally High ROI" : null,
            course.universities?.is_premium ? "Top-Tier University" : null,
            isCareerMatch ? `Optimized for ${parsedIntent.careerGoal}` : null
          ].filter(Boolean)
        };
      });

    // Rank and return top 3
    const topMatches = scoredMatches
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    return NextResponse.json({
      success: true,
      parsedIntent,
      matches: topMatches,
    });

  } catch (err) {
    console.error('[/api/match] Error:', err);
    return NextResponse.json({ error: 'AI Matching Engine error' }, { status: 500 });
  }
}
