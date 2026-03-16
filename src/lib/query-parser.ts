import type { ParsedQuery } from "./types";

// ─── Rupee amount patterns ────────────────────────────────────────────────────
// Handles: "2 lakh", "2L", "2.5 lakhs", "200000", "₹1.5 lakh"
const LAKH_RE = /(\d+(?:\.\d+)?)\s*(?:l(?:akh)?s?)/i;
const RAW_NUM_RE = /₹?\s*(\d{4,7})/; // raw numbers like 150000

function parseBudget(text: string): number | null {
  const lakhMatch = text.match(LAKH_RE);
  if (lakhMatch) return Math.round(parseFloat(lakhMatch[1]) * 100_000);

  const rawMatch = text.match(RAW_NUM_RE);
  if (rawMatch) return parseInt(rawMatch[1], 10);

  return null;
}

// ─── Degree keywords ──────────────────────────────────────────────────────────
const DEGREE_KEYWORDS = [
  "mba", "mca", "mcom", "m.com", "bba", "bca", "bcom", "b.com",
  "bsc", "b.sc", "msc", "m.sc", "pgdm", "phd", "ba", "ma",
  "data science", "finance", "marketing", "hr", "operations",
];

function parseDegree(text: string): string | null {
  const lower = text.toLowerCase();
  for (const kw of DEGREE_KEYWORDS) {
    if (lower.includes(kw)) return kw.toUpperCase().replace(".", "");
  }
  return null;
}

// ─── Approval keywords ───────────────────────────────────────────────────────
const APPROVAL_MAP: Record<string, string> = {
  "ugc": "UGC-DEB",
  "ugc-deb": "UGC-DEB",
  "aicte": "AICTE",
  "naac": "NAAC A+",
  "naac a+": "NAAC A+",
  "naac a": "NAAC A",
};

function parseApprovals(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [key, value] of Object.entries(APPROVAL_MAP)) {
    if (lower.includes(key) && !found.includes(value)) found.push(value);
  }
  return found;
}

// ─── Main Parser ─────────────────────────────────────────────────────────────
export function parseQuery(query: string): ParsedQuery {
  const lower = query.toLowerCase();

  return {
    maxBudgetInr: parseBudget(lower),
    degreeKeyword: parseDegree(lower),
    requiresEmi:
      lower.includes("emi") ||
      lower.includes("installment") ||
      lower.includes("monthly"),
    requiredApprovals: parseApprovals(lower),
    careerGoal: null, // Gemini backend handles specific extraction
  };
}
