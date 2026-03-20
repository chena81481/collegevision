/**
 * CollegeVision – Advanced ROI & Payback Calculator
 */

export type ROIInput = {
  totalFee: number;
  avgCTC: number;
  currentSalary?: number;
  durationMonths: number;
  placementRate: number; // %
  loanInterestRate?: number; // %
  isOnline: boolean;
};

export interface ROIResult {
  roiScore: number;
  totalCost: number;
  salaryGain: number;
  riskPenalty: number;
  opportunityCost: number;
  paybackMonths: number;
  paybackYears: number;
  totalReturnsFiveYears: number;
}

export function calculateROI(input: ROIInput): ROIResult {
  const {
    totalFee,
    avgCTC,
    currentSalary = 0,
    durationMonths,
    placementRate,
    loanInterestRate = 0,
    isOnline,
  } = input;

  const durationYears = durationMonths / 12;

  // Interest cost
  const interestCost = totalFee * (loanInterestRate / 100);

  const totalCost = totalFee + interestCost;

  // Salary gain (Fixed 5-year horizon as per core idea)
  const salaryGain = (avgCTC - currentSalary) * 5;

  // Opportunity cost
  const opportunityCost = isOnline
    ? currentSalary * 0.2
    : currentSalary * durationYears;

  // Risk penalty
  const riskPenalty = totalCost * (1 - placementRate / 100);

  const netGain = salaryGain - totalCost - opportunityCost - riskPenalty;

  const roiScore = netGain / durationYears;

  // Payback Period (Months)
  // Simple payback = Total Cost / (Monthly Salary of the new role)
  const paybackMonths = avgCTC > 0 ? (totalCost / (avgCTC / 12)) : 99;

  return {
    roiScore,
    totalCost,
    salaryGain,
    riskPenalty,
    opportunityCost,
    paybackMonths,
    paybackYears: Number((paybackMonths / 12).toFixed(1)),
    totalReturnsFiveYears: netGain,
  };
}

/** Determines the ROI rating based on the score */
export function getROIRating(roiScore: number): "high" | "moderate" | "low" {
  if (roiScore > 500000) return "high"; // > 5L net gain per year
  if (roiScore > 200000) return "moderate"; // 2L - 5L net gain per year
  return "low";
}

/** Formats a fee in INR for display, e.g. 175000 → "₹1,75,000" */
export function formatFeeINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Formats ROI score for display */
export function formatROIScore(score: number): string {
  if (score >= 100000) {
    return `₹${(score / 100000).toFixed(1)}L / yr`;
  }
  return `₹${(score / 1000).toFixed(0)}k / yr`;
}
