import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { calculateROI } from "@/lib/roi-calculator";
import { parseQuery } from "@/lib/query-parser";
import type { CourseMatch } from "@/lib/types";
import {
  FALLBACK_COURSE_CATALOG,
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
  studentLevel: "Bachelors" | "Masters" | "Other";
  admissionReadiness: "High" | "Medium" | "Low";
  confidenceScore: number;
}

interface MatchEngineResult {
  parsedIntent: MatchIntent;
  matches: CourseMatch[];
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
    studentLevel: inferStudentLevel(degreeType),
    admissionReadiness: /\burgent|asap|this month|apply now\b/i.test(query)
      ? "High"
      : /\bexploring|research|compare\b/i.test(query)
        ? "Medium"
        : "Low",
    confidenceScore: degreeType || parsed.maxBudgetInr || parsed.requiredApprovals.length > 0 ? 82 : 68,
  };
}

async function buildIntent(query: string): Promise<MatchIntent> {
  const fallbackIntent = buildLocalIntent(query);
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackIntent;
  }

  try {
    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
Extract structured requirements from this college search query.
Return only valid JSON with these exact keys:
degreeType, maxBudgetINR, isStrictBudget, needsEMI, requiredApproval, careerGoal, studentLevel, admissionReadiness, confidenceScore

Query: "${query.trim()}"
    `.trim();

    const result = await model.generateContent(prompt);
    const rawText = result.response
      .text()
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
      : "Balanced fee-to-outcome profile.",
    isCareerMatch && intent.careerGoal
      ? `Strong fit for ${intent.careerGoal.toLowerCase()}-oriented roles.`
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
      recommendedFor: intent.careerGoal ?? intent.degreeType ?? "ROI-first learners",
      decisionSummary: buildDecisionSummary(course, intent, finalFee),
    } satisfies CourseMatch,
    isCareerMatch,
  };
}

export async function getMatchesForQuery(
  query: string,
  authToken?: string
): Promise<MatchEngineResult> {
  const parsedIntent = await buildIntent(query);
  const [catalog, studentScore] = await Promise.all([
    fetchCatalogFromSupabase(),
    fetchStudentScore(authToken),
  ]);

  const sourceCatalog = catalog && catalog.length > 0 ? catalog : FALLBACK_COURSE_CATALOG;

  const matches = sourceCatalog
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
    .slice(0, 3)
    .map((item) => item.match);

  return {
    parsedIntent,
    matches,
  };
}
