import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import { calculateROI } from "@/lib/roi-calculator";
import { parseQuery } from "@/lib/query-parser";
import type { CourseMatch } from "@/lib/types";
import {
  type CatalogCourse,
  type CatalogScholarship,
} from "@/lib/course-catalog";

export interface MatchIntent {
  degreeType: string | null;
  maxBudgetINR: number | null;
  isStrictBudget: boolean;
  needsEMI: boolean;
  requiredApproval: string | null;
  careerGoal: string | null;
  targetInstitution: string | null;
  programFormat: "Executive" | "Online" | "Distance" | "Regular" | null;
  studentLevel: "Bachelors" | "Masters" | "Other";
  admissionReadiness: "High" | "Medium" | "Low";
  confidenceScore: number;
}

interface MatchEngineResult {
  parsedIntent: MatchIntent;
  matches: CourseMatch[];
  source: "gemini" | "gemini_unavailable";
}

interface SupabaseCourseRow {
  id: string;
  name: string;
  degree_level: "Bachelors" | "Masters" | "Other";
  duration_months: number | null;
  total_fee_inr: number;
  avg_ctc_inr: number | null;
  has_zero_cost_emi: boolean | null;
  approvals: string[] | null;
  category: string | null;
  badge_label: string | null;
  scholarships?: {
    name: string;
    min_score: number;
    discount_percentage: number;
    eligibility_criteria: string;
  }[];
  universities?: {
    name: string;
    slug: string;
    logo_url: string | null;
    gradient_start: string | null;
    gradient_end: string | null;
    is_premium?: boolean | null;
  }[] | null;
}

function getGeminiApiKey() {
  const key = (
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    ""
  ).trim();
  
  if (!key) {
    console.error("[match-engine] CRITICAL: No Gemini API Key found in environment variables.");
  } else {
    console.log("[match-engine] API Key found (ends with ...%s)", key.slice(-4));
  }
  
  return key;
}

const STRICT_BUDGET_PATTERN =
  /\b(strict|strictly|not more than|within|max(?:imum)?|cap|under)\b/i;
const CAREER_PATTERNS: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /\bproduct manager\b/i, value: "Product Manager" },
  { pattern: /\bdata science|data scientist|analytics\b/i, value: "Data Science" },
  { pattern: /\bsoftware|developer|tech|engineering\b/i, value: "Technology" },
  { pattern: /\bfinance|banking|investment\b/i, value: "Finance" },
  { pattern: /\bmarketing|brand|growth\b/i, value: "Marketing" },
  { pattern: /\bhr|human resources\b/i, value: "Human Resources" },
];

const CAREER_KEYWORDS: Record<string, string[]> = {
  "Product Manager": ["mba", "business", "management", "product"],
  "Data Science": ["data science", "analytics", "mca", "bca", "bsc"],
  Technology: ["mca", "bca", "computer", "software", "data science"],
  Finance: ["finance", "mcom", "mba", "accounts"],
  Marketing: ["marketing", "mba", "business"],
  "Human Resources": ["hr", "management", "mba"],
};

const INSTITUTION_PATTERNS: Array<{ pattern: RegExp; value: string }> = [
  { pattern: /\biims?\b|\bindian institute of management\b/i, value: "IIM" },
  { pattern: /\biits?\b|\bindian institute of technology\b/i, value: "IIT" },
];

function inferCareerGoal(query: string): string | null {
  for (const item of CAREER_PATTERNS) {
    if (item.pattern.test(query)) {
      return item.value;
    }
  }
  return null;
}

function inferStudentLevel(degreeType: string | null): MatchIntent["studentLevel"] {
  if (!degreeType) {
    return "Other";
  }

  const normalized = degreeType.toLowerCase();

  if (
    normalized.startsWith("b") ||
    normalized.includes("bachelor") ||
    normalized.includes("bsc") ||
    normalized.includes("bca") ||
    normalized.includes("bba")
  ) {
    return "Bachelors";
  }

  if (
    normalized.startsWith("m") ||
    normalized.includes("master") ||
    normalized.includes("mba") ||
    normalized.includes("mca")
  ) {
    return "Masters";
  }

  return "Other";
}

function inferTargetInstitution(query: string): string | null {
  for (const item of INSTITUTION_PATTERNS) {
    if (item.pattern.test(query)) {
      return item.value;
    }
  }
  return null;
}

function inferProgramFormat(query: string): MatchIntent["programFormat"] {
  if (/\bexecutive|excutive|exec\b/i.test(query)) {
    return "Executive";
  }
  if (/\bonline\b/i.test(query)) {
    return "Online";
  }
  if (/\bdistance|correspondence\b/i.test(query)) {
    return "Distance";
  }
  if (/\bregular|campus|full[-\s]?time\b/i.test(query)) {
    return "Regular";
  }
  return null;
}

function buildLocalIntent(query: string): MatchIntent {
  const parsed = parseQuery(query);
  const degreeType = parsed.degreeKeyword;

  return {
    degreeType,
    maxBudgetINR: parsed.maxBudgetInr,
    isStrictBudget: STRICT_BUDGET_PATTERN.test(query),
    needsEMI: parsed.requiresEmi,
    requiredApproval: parsed.requiredApprovals[0] ?? null,
    careerGoal: inferCareerGoal(query),
    targetInstitution: inferTargetInstitution(query),
    programFormat: inferProgramFormat(query),
    studentLevel: inferStudentLevel(degreeType),
    admissionReadiness: /\burgent|asap|this month|apply now\b/i.test(query)
      ? "High"
      : /\bexploring|research|compare\b/i.test(query)
        ? "Medium"
        : "Low",
    confidenceScore:
      degreeType ||
      parsed.maxBudgetInr ||
      parsed.requiredApprovals.length > 0 ||
      inferTargetInstitution(query) ||
      inferProgramFormat(query)
        ? 86
        : 68,
  };
}

async function buildIntent(query: string): Promise<MatchIntent> {
  const fallbackIntent = buildLocalIntent(query);
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return fallbackIntent;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Extract structured requirements from this college search query.
Return only valid JSON with these exact keys:
degreeType, maxBudgetINR, isStrictBudget, needsEMI, requiredApproval, careerGoal, targetInstitution, programFormat, studentLevel, admissionReadiness, confidenceScore

Normalize common typos:
- "excutive" means "Executive".
- "iim" means targetInstitution "IIM".

Query: "${query.trim()}"
    `.trim();

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const rawText = (result.text || "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(rawText) as Partial<MatchIntent>;

    return {
      degreeType: parsed.degreeType ?? fallbackIntent.degreeType,
      maxBudgetINR:
        typeof parsed.maxBudgetINR === "number" ? parsed.maxBudgetINR : fallbackIntent.maxBudgetINR,
      isStrictBudget: parsed.isStrictBudget ?? fallbackIntent.isStrictBudget,
      needsEMI: parsed.needsEMI ?? fallbackIntent.needsEMI,
      requiredApproval: parsed.requiredApproval ?? fallbackIntent.requiredApproval,
      careerGoal: parsed.careerGoal ?? fallbackIntent.careerGoal,
      targetInstitution: parsed.targetInstitution ?? fallbackIntent.targetInstitution,
      programFormat: parsed.programFormat ?? fallbackIntent.programFormat,
      studentLevel: parsed.studentLevel ?? fallbackIntent.studentLevel,
      admissionReadiness: parsed.admissionReadiness ?? fallbackIntent.admissionReadiness,
      confidenceScore:
        typeof parsed.confidenceScore === "number"
          ? Math.max(0, Math.min(100, parsed.confidenceScore))
          : fallbackIntent.confidenceScore,
    };
  } catch {
    return fallbackIntent;
  }
}

function canUseSupabaseAdmin() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function normalizeApprovals(approvals: unknown): string[] {
  if (!Array.isArray(approvals)) {
    return ["Verification pending"];
  }

  const cleaned = approvals
    .filter((approval): approval is string => typeof approval === "string")
    .map((approval) => approval.trim())
    .filter(Boolean)
    .slice(0, 4);

  return cleaned.length > 0 ? cleaned : ["Verification pending"];
}

function normalizeDegreeLevel(value: unknown): CatalogCourse["degreeLevel"] {
  if (value === "Bachelors" || value === "Masters" || value === "Other") {
    return value;
  }

  return "Other";
}

function normalizeNumber(value: unknown, fallback: number, min: number, max: number) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, Math.round(numeric)));
}

function extractJsonArray(rawText: string) {
  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return cleaned.slice(start, end + 1);
}

function parseGeminiCatalogText(rawText: string): unknown[] | null {
  const arrayText = extractJsonArray(rawText);

  if (arrayText) {
    const parsed = JSON.parse(arrayText);
    return Array.isArray(parsed) ? parsed : null;
  }

  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}");

  if (objectStart === -1 || objectEnd === -1 || objectEnd <= objectStart) {
    return null;
  }

  const parsed = JSON.parse(cleaned.slice(objectStart, objectEnd + 1));
  if (Array.isArray(parsed?.recommendations)) {
    return parsed.recommendations;
  }
  if (Array.isArray(parsed?.courses)) {
    return parsed.courses;
  }
  if (Array.isArray(parsed?.matches)) {
    return parsed.matches;
  }

  return null;
}

function mapGeminiCatalogItems(items: unknown[], intent: MatchIntent): CatalogCourse[] {
  return items
    .map((item: any, index: number): CatalogCourse | null => {
      const universityName =
        typeof item?.universityName === "string" && item.universityName.trim()
          ? item.universityName.trim()
          : typeof item?.university === "string" && item.university.trim()
            ? item.university.trim()
            : typeof item?.institutionName === "string" && item.institutionName.trim()
              ? item.institutionName.trim()
              : null;
      const courseName =
        typeof item?.courseName === "string" && item.courseName.trim()
          ? item.courseName.trim()
          : typeof item?.programName === "string" && item.programName.trim()
            ? item.programName.trim()
            : typeof item?.program === "string" && item.program.trim()
              ? item.program.trim()
              : intent.degreeType
                ? `Online ${intent.degreeType.toUpperCase()}`
                : "Online Degree";

      if (!universityName) {
        return null;
      }

      const universitySlug =
        typeof item?.universitySlug === "string" && item.universitySlug.trim()
          ? slugify(item.universitySlug)
          : slugify(universityName);
      const category =
        typeof item?.category === "string" && item.category.trim()
          ? slugify(item.category)
          : intent.degreeType
            ? `online-${slugify(intent.degreeType)}`
            : "online-degrees";

      return {
        id: `gemini-${universitySlug}-${slugify(courseName)}-${index + 1}`,
        name: courseName,
        degreeLevel: normalizeDegreeLevel(item?.degreeLevel),
        durationMonths: normalizeNumber(item?.durationMonths, intent.studentLevel === "Bachelors" ? 36 : 24, 6, 60),
        totalFeeInr: normalizeNumber(item?.totalFeeInr ?? item?.feeInr ?? item?.fees, 150000, 20000, 800000),
        avgCtcInr: normalizeNumber(item?.avgCtcInr ?? item?.avgSalaryInr ?? item?.expectedCtcInr, 600000, 200000, 2500000),
        hasZeroCostEmi: Boolean(item?.hasZeroCostEmi ?? item?.emiAvailable),
        approvals: normalizeApprovals(item?.approvals),
        category,
        badgeLabel:
          typeof item?.badgeLabel === "string" && item.badgeLabel.trim()
            ? item.badgeLabel.trim().slice(0, 32)
            : "AI Suggested",
        generatedByAi: true,
        sourceNote:
          typeof item?.sourceNote === "string" && item.sourceNote.trim()
            ? item.sourceNote.trim().slice(0, 180)
            : "AI-generated recommendation. Verify final fees, approvals and eligibility with the university before applying.",
        university: {
          name: universityName,
          slug: universitySlug,
          logoUrl: null,
          gradientStart: index % 2 === 0 ? "from-blue-50" : "from-emerald-50",
          gradientEnd: "to-white",
          isPremium: Boolean(item?.isPremium),
        },
      };
    })
    .filter((course): course is CatalogCourse => Boolean(course));
}

async function fetchGeminiGeneratedCatalog(query: string, intent: MatchIntent): Promise<CatalogCourse[] | null> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return null;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are the CollegeVision Discovery Engine, a premium Indian EdTech consultant.
Your mission is to recommend the 3-5 best Indian Online or Distance universities based on the student's budget, career goal, and timeline.

SEARCH GROUNDING INSTRUCTIONS:
- Use Google Search to verify the latest 2026 tuition fees, UGC-DEB/AICTE/NAAC approval statuses, and average placement CTCs for Indian universities.
- Focus on top-tier providers (e.g., Amity, Manipal, LPU, Jain, Cu, Symbiosis, IIMs, IITs).

RULES:
- For "Executive" intent or "IIM" queries, prioritize IIM Executive PGP/PGDM or specialized management certificates.
- If the budget is strict, do NOT exceed it unless the ROI is exceptional, in which case explain why it is a "stretch" option in the sourceNote.
- Return ONLY a valid JSON array of objects. No markdown.

JSON SCHEMA:
大学 (universityName): String
universitySlug: String (kebab-case)
courseName: String
degreeLevel: "Bachelors" | "Masters" | "Other"
durationMonths: Number
totalFeeInr: Number
avgCtcInr: Number
hasZeroCostEmi: Boolean
approvals: String[]
category: String (kebab-case)
badgeLabel: String (e.g. "Global Brand", "Best Placement", "Budget Winner")
isPremium: Boolean
sourceNote: String (Max 150 chars: explaining why this fits the query + grounding verification note)

Student Query: "${query.trim()}"
Parsed Intent: ${JSON.stringify(intent)}
`;

    let result;
    const modelsToTry = [
      { name: "gemini-2.0-flash", grounded: true },
      { name: "gemini-1.5-pro", grounded: true },
      { name: "gemini-1.5-flash", grounded: false },
    ];

    for (const modelInfo of modelsToTry) {
      try {
        console.log(`[match-engine] Attempting match discovery with ${modelInfo.name} (grounded: ${modelInfo.grounded})...`);
        const tools = modelInfo.grounded ? [{ googleSearch: {} } as any] : undefined;
        
        result = await ai.models.generateContent({
          model: modelInfo.name,
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: tools ? { tools } : undefined,
        });
        
        if (result.text) {
          console.log(`[match-engine] Successfully received results from ${modelInfo.name}`);
          break;
        }
      } catch (error) {
        console.warn(`[match-engine] Call to ${modelInfo.name} failed:`, error);
        continue;
      }
    }

    if (!result || !result.text) {
      console.error("[match-engine] ALL Gemini model attempts failed. Returning empty matches.");
      return null;
    }

    const parsed = parseGeminiCatalogText(result.text);

    const courses = parsed ? mapGeminiCatalogItems(parsed, intent) : [];

    return courses;
  } catch (error) {
    console.error("[match-engine] Gemini catalog generation failed:", error);
    return null;
  }
}

async function fetchCatalogFromSupabase(): Promise<CatalogCourse[] | null> {
  if (!canUseSupabaseAdmin()) {
    return null;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data, error } = await supabase
      .from("courses")
      .select(
        `
          id,
          name,
          degree_level,
          duration_months,
          total_fee_inr,
          avg_ctc_inr,
          has_zero_cost_emi,
          approvals,
          category,
          badge_label,
          scholarships (
            name,
            min_score,
            discount_percentage,
            eligibility_criteria
          ),
          universities (
            name,
            slug,
            logo_url,
            gradient_start,
            gradient_end,
            is_premium
          )
        `
      )
      .limit(50);

    if (error || !data) {
      return null;
    }

    return ((data as unknown as SupabaseCourseRow[]) ?? []).map((course) => {
      const university = course.universities?.[0];

      return {
      id: course.id,
      name: course.name,
      degreeLevel: course.degree_level ?? "Other",
      durationMonths: course.duration_months ?? 24,
      totalFeeInr: course.total_fee_inr,
      avgCtcInr: course.avg_ctc_inr ?? 0,
      hasZeroCostEmi: Boolean(course.has_zero_cost_emi),
      approvals: course.approvals ?? [],
      category: course.category ?? "online-degrees",
      badgeLabel: course.badge_label ?? null,
      generatedByAi: false,
      scholarships: (course.scholarships ?? []).map((item) => ({
        name: item.name,
        minScore: item.min_score,
        discountPercentage: item.discount_percentage,
        criteria: item.eligibility_criteria,
      })),
      university: {
        name: university?.name ?? "CollegeVision Partner",
        slug: university?.slug ?? course.id,
        logoUrl: university?.logo_url ?? null,
        gradientStart: university?.gradient_start ?? "from-slate-50",
        gradientEnd: university?.gradient_end ?? "to-white",
        isPremium: Boolean(university?.is_premium),
      },
    };
    });
  } catch {
    return null;
  }
}

async function fetchStudentScore(authToken?: string): Promise<number | null> {
  if (!authToken || !canUseSupabaseAdmin()) {
    return null;
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser(authToken);

    if (!user) {
      return null;
    }

    const { data } = await supabase
      .from("student_profiles")
      .select("score_percentage")
      .eq("user_id", user.id)
      .single();

    return typeof data?.score_percentage === "number" ? data.score_percentage : null;
  } catch {
    return null;
  }
}

function getAdmissionProbability(level: MatchIntent["admissionReadiness"]) {
  if (level === "High") {
    return 92;
  }
  if (level === "Medium") {
    return 74;
  }
  return 58;
}

function getAdmissionConditions(course: CatalogCourse) {
  if (course.degreeLevel === "Masters") {
    return ["Requires a recognized bachelor's degree."];
  }
  if (course.degreeLevel === "Bachelors") {
    return ["Requires 10+2 completion from a recognized board."];
  }
  return ["Eligibility varies by university and specialization."];
}

function buildDecisionSummary(course: CatalogCourse, intent: MatchIntent, finalFee: number) {
  const parts = [
    `${course.university.name} keeps your projected investment around INR ${Math.round(finalFee / 1000)}k`,
    course.hasZeroCostEmi ? "supports zero-cost EMI" : "leans on upfront fee planning",
  ];

  if (intent.careerGoal) {
    parts.push(`and aligns best with ${intent.careerGoal.toLowerCase()} outcomes`);
  } else if (intent.degreeType) {
    parts.push(`for students prioritizing ${intent.degreeType.toUpperCase()} progression`);
  } else {
    parts.push("for students optimizing affordability and outcomes together");
  }

  return `${parts[0]}, ${parts[1]}, ${parts[2]}.`;
}

function findQualifiedScholarship(
  scholarships: CatalogScholarship[] | undefined,
  studentScore: number | null,
  totalFeeInr: number
): CourseMatch["qualifiedScholarship"] {
  if (!studentScore || !scholarships?.length) {
    return undefined;
  }

  const bestScholarship = scholarships
    .filter((item) => studentScore >= item.minScore)
    .sort((left, right) => right.discountPercentage - left.discountPercentage)[0];

  if (!bestScholarship) {
    return undefined;
  }

  return {
    name: bestScholarship.name,
    discountPercentage: bestScholarship.discountPercentage,
    amountSaved: Math.round(totalFeeInr * (bestScholarship.discountPercentage / 100)),
    criteria: bestScholarship.criteria,
  };
}

function scoreCourse(course: CatalogCourse, intent: MatchIntent, studentScore: number | null) {
  if (intent.isStrictBudget && intent.maxBudgetINR && course.totalFeeInr > intent.maxBudgetINR * 1.05) {
    return null;
  }

  let score = 20;

  if (intent.maxBudgetINR) {
    if (course.totalFeeInr <= intent.maxBudgetINR) {
      score += 26;
    } else if (course.totalFeeInr <= intent.maxBudgetINR * 1.2) {
      score += 12;
    } else {
      score -= 8;
    }
  }

  if (intent.degreeType && course.name.toLowerCase().includes(intent.degreeType.toLowerCase())) {
    score += 20;
  }

  if (intent.programFormat) {
    const normalizedFormat = intent.programFormat.toLowerCase();
    const courseText = `${course.name} ${course.university.name}`.toLowerCase();
    if (
      courseText.includes(normalizedFormat) ||
      (normalizedFormat === "executive" && /\bepgp|epgdm|executive|senior management|advanced management\b/i.test(courseText))
    ) {
      score += 18;
    } else if (normalizedFormat === "executive") {
      score -= 10;
    }
  }

  if (intent.targetInstitution) {
    const institutionText = `${course.university.name} ${course.name}`.toLowerCase();
    if (
      intent.targetInstitution === "IIM" &&
      (/\biim\b/i.test(institutionText) || institutionText.includes("indian institute of management"))
    ) {
      score += 35;
    } else if (
      intent.targetInstitution === "IIT" &&
      (/\biit\b/i.test(institutionText) || institutionText.includes("indian institute of technology"))
    ) {
      score += 35;
    } else {
      score -= 30;
    }
  }

  if (intent.requiredApproval) {
    if (course.approvals.includes(intent.requiredApproval)) {
      score += 15;
    } else {
      score -= 10;
    }
  }

  if (intent.needsEMI && course.hasZeroCostEmi) {
    score += 10;
  }

  const careerGoalKeywords = intent.careerGoal ? CAREER_KEYWORDS[intent.careerGoal] ?? [] : [];
  const searchableText = `${course.name} ${course.university.name}`.toLowerCase();
  const isCareerMatch =
    careerGoalKeywords.length > 0 &&
    careerGoalKeywords.some((keyword) => searchableText.includes(keyword));

  if (isCareerMatch) {
    score += 18;
  }

  const roi = calculateROI({
    totalFee: course.totalFeeInr,
    avgCTC: course.avgCtcInr,
    currentSalary: 0,
    durationMonths: course.durationMonths,
    placementRate: course.university.isPremium ? 85 : 72,
    isOnline: true,
  });

  if (roi.totalReturnsFiveYears > 1000000) {
    score += 12;
  } else if (roi.totalReturnsFiveYears > 500000) {
    score += 6;
  }

  const qualifiedScholarship = findQualifiedScholarship(
    course.scholarships,
    studentScore,
    course.totalFeeInr
  );
  const finalFee = qualifiedScholarship
    ? course.totalFeeInr - qualifiedScholarship.amountSaved
    : course.totalFeeInr;
  const monthlyEmiEstimate = course.hasZeroCostEmi
    ? Math.round(finalFee / Math.max(course.durationMonths, 1))
    : null;

  if (qualifiedScholarship) {
    score += 6;
  }

  const cautionFlags: string[] = [];
  if (course.generatedByAi) {
    cautionFlags.push("AI-expanded option: verify final approvals, fees, eligibility, and EMI terms before applying.");
  }
  if (course.sourceNote) {
    cautionFlags.push(course.sourceNote);
  }
  if (intent.maxBudgetINR && course.totalFeeInr > intent.maxBudgetINR) {
    cautionFlags.push("Sits above your stated budget, so treat this as a stretch option.");
  }
  if (intent.requiredApproval && !course.approvals.includes(intent.requiredApproval)) {
    cautionFlags.push(`Does not explicitly show the ${intent.requiredApproval} approval you asked for.`);
  }
  if (intent.needsEMI && !course.hasZeroCostEmi) {
    cautionFlags.push("No zero-cost EMI signal detected, so monthly affordability may be tighter.");
  }
  if ((course.avgCtcInr ?? 0) < 600000) {
    cautionFlags.push("Outcome potential looks steadier than breakout, so compare this against higher-earning options.");
  }

  const matchReasons = [
    intent.maxBudgetINR
      ? finalFee <= intent.maxBudgetINR
        ? "Fits within your current budget band."
        : "Still viable if you can stretch your budget."
      : intent.targetInstitution
        ? `Prioritizes your ${intent.targetInstitution} institution preference.`
      : "Balanced fee-to-outcome profile.",
    isCareerMatch && intent.careerGoal
      ? `Strong fit for ${intent.careerGoal.toLowerCase()}-oriented roles.`
      : intent.programFormat === "Executive"
        ? "Designed for executive or working-professional learning intent."
      : intent.degreeType
        ? `Directly aligned with your ${intent.degreeType.toUpperCase()} search intent.`
        : "Good general-purpose option across employability and ROI.",
    course.hasZeroCostEmi
      ? "Zero-cost EMI can smooth the payment burden."
      : "Best suited for students comfortable with upfront or standard financing.",
  ];

  const normalizedScore = Math.max(
    35,
    Math.min(99, Math.round(score * (intent.confidenceScore / 100) + 10))
  );

  return {
    match: {
      id: course.id,
      universityName: course.university.name,
      universitySlug: course.university.slug,
      logoUrl: course.university.logoUrl,
      gradientStart: course.university.gradientStart,
      gradientEnd: course.university.gradientEnd,
      courseName: course.name,
      degreeLevel: course.degreeLevel,
      durationMonths: course.durationMonths,
      totalFeeInr: course.totalFeeInr,
      avgCtcInr: course.avgCtcInr,
      hasZeroCostEmi: course.hasZeroCostEmi,
      approvals: course.approvals,
      badgeLabel: course.badgeLabel,
      generatedByAi: course.generatedByAi,
      sourceNote: course.sourceNote,
      roi: Math.max(100, Math.round((roi.totalReturnsFiveYears / course.totalFeeInr) * 100)),
      category: course.category,
      matchScore: normalizedScore,
      confidenceScore: intent.confidenceScore,
      admissionProbability: getAdmissionProbability(intent.admissionReadiness),
      admissionConditions: getAdmissionConditions(course),
      ...(qualifiedScholarship ? { qualifiedScholarship } : {}),
      matchReasons,
      cautionFlags,
      monthlyEmiEstimate,
      recommendedFor:
        intent.programFormat === "Executive"
          ? "Working professionals seeking executive management credentials"
          : intent.careerGoal ?? intent.degreeType ?? "ROI-first learners",
      decisionSummary: buildDecisionSummary(course, intent, finalFee),
    } satisfies CourseMatch,
    isCareerMatch,
  };
}

async function enrichMatchesWithAiRoi(
  query: string,
  intent: MatchIntent,
  matches: CourseMatch[]
): Promise<CourseMatch[]> {
  const apiKey = getGeminiApiKey();

  if (!apiKey || matches.length === 0) {
    return matches;
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are CollegeVision's AI ROI analyst for Indian online degrees.
Analyze these matched courses and estimate practical ROI for a student. Use the numeric formula ROI as a baseline, but adjust for brand signal, approval certainty, affordability, career fit, EMI risk, and data confidence.

Return only a valid JSON array. No markdown.
Each item must use exactly these keys:
id, aiRoiScore, aiPaybackMonths, aiOutcomeBand, aiRoiSummary, aiRoiRisks

Rules:
- aiRoiScore is a percentage from 100 to 2500.
- aiPaybackMonths is a realistic integer from 3 to 96.
- aiOutcomeBand must be "High", "Moderate", or "Watchlist".
- aiRoiSummary must be one short student-friendly sentence.
- aiRoiRisks must be 1-3 short warning strings.
- If university data is AI-generated or verification pending, be more conservative.

Student query: "${query.trim()}"
Parsed intent: ${JSON.stringify(intent)}
Matches: ${JSON.stringify(
      matches.map((match) => ({
        id: match.id,
        universityName: match.universityName,
        courseName: match.courseName,
        totalFeeInr: match.totalFeeInr,
        avgCtcInr: match.avgCtcInr,
        durationMonths: match.durationMonths,
        formulaRoi: match.roi,
        hasZeroCostEmi: match.hasZeroCostEmi,
        approvals: match.approvals,
        generatedByAi: match.generatedByAi,
        decisionSummary: match.decisionSummary,
      }))
    )}
    `.trim();

    const result = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const jsonText = extractJsonArray(result.text || "");
    if (!jsonText) {
      return matches;
    }

    const parsed = JSON.parse(jsonText);
    if (!Array.isArray(parsed)) {
      return matches;
    }

    const aiRoiById = new Map<string, any>();
    for (const item of parsed) {
      if (typeof item?.id === "string") {
        aiRoiById.set(item.id, item);
      }
    }

    return matches.map((match) => {
      const aiRoi = aiRoiById.get(match.id);
      if (!aiRoi) {
        return match;
      }

      const aiRoiScore = normalizeNumber(aiRoi.aiRoiScore, match.roi ?? 100, 100, 2500);
      const aiPaybackMonths = normalizeNumber(
        aiRoi.aiPaybackMonths,
        Math.round((match.totalFeeInr / Math.max(match.avgCtcInr ?? 600000, 1)) * 12),
        3,
        96
      );
      const aiOutcomeBand =
        aiRoi.aiOutcomeBand === "High" ||
        aiRoi.aiOutcomeBand === "Moderate" ||
        aiRoi.aiOutcomeBand === "Watchlist"
          ? aiRoi.aiOutcomeBand
          : aiRoiScore >= 900
            ? "High"
            : aiRoiScore >= 450
              ? "Moderate"
              : "Watchlist";
      const aiRoiSummary =
        typeof aiRoi.aiRoiSummary === "string" && aiRoi.aiRoiSummary.trim()
          ? aiRoi.aiRoiSummary.trim().slice(0, 180)
          : null;
      const aiRoiRisks = Array.isArray(aiRoi.aiRoiRisks)
        ? aiRoi.aiRoiRisks
            .filter((risk: unknown): risk is string => typeof risk === "string")
            .map((risk: string) => risk.trim())
            .filter(Boolean)
            .slice(0, 3)
        : [];

      return {
        ...match,
        roi: aiRoiScore,
        aiRoiScore,
        aiPaybackMonths,
        aiOutcomeBand,
        aiRoiSummary,
        aiRoiRisks,
        matchReasons: aiRoiSummary
          ? [aiRoiSummary, ...(match.matchReasons ?? [])].slice(0, 3)
          : match.matchReasons,
        cautionFlags: [...(match.cautionFlags ?? []), ...aiRoiRisks].slice(0, 4),
      };
    });
  } catch (error) {
    console.error("[match-engine] Gemini ROI enrichment failed:", error);
    return matches;
  }
}

export async function getMatchesForQuery(
  query: string,
  authToken?: string
): Promise<MatchEngineResult> {
  const parsedIntent = await buildIntent(query);
  const [geminiCatalog, studentScore] = await Promise.all([
    fetchGeminiGeneratedCatalog(query, parsedIntent),
    fetchStudentScore(authToken),
  ]);

  const source: MatchEngineResult["source"] =
    geminiCatalog && geminiCatalog.length > 0 ? "gemini" : "gemini_unavailable";
  const sourceCatalog = geminiCatalog ?? [];

  const scoredMatches = sourceCatalog
    .map((course) => scoreCourse(course, parsedIntent, studentScore))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((left, right) => {
      if (right.match.matchScore !== left.match.matchScore) {
        return right.match.matchScore - left.match.matchScore;
      }
      if (right.isCareerMatch !== left.isCareerMatch) {
        return Number(right.isCareerMatch) - Number(left.isCareerMatch);
      }
      return left.match.totalFeeInr - right.match.totalFeeInr;
    })
    .slice(0, 6)
    .map((item) => item.match);

  const matches = await enrichMatchesWithAiRoi(query, parsedIntent, scoredMatches);

  return {
    parsedIntent,
    matches,
    source,
  };
}
