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
  scholarshipAmount?: number;
  monthlyLivingCost?: number;
  salaryGrowthRate?: number; // %
  inflationRate?: number; // %
  internshipIncome?: number;
};

export interface ROIResult {
  roiScore: number;
  totalCost: number;
  netTuitionCost: number;
  financingCost: number;
  salaryGain: number;
  riskPenalty: number;
  opportunityCost: number;
  paybackMonths: number;
  paybackYears: number;
  breakEvenYear: number;
  totalReturnsFiveYears: number;
  expectedFiveYearSalary: number;
  netPresentValue: number;
  affordabilityIndex: number;
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
    scholarshipAmount = 0,
    monthlyLivingCost = 0,
    salaryGrowthRate = 8,
    inflationRate = 5,
    internshipIncome = 0,
  } = input;

  const durationYears = durationMonths / 12;
  const netTuitionCost = Math.max(0, totalFee - scholarshipAmount);

  // Financing cost
  const financingCost = netTuitionCost * (loanInterestRate / 100);
  const livingCost = monthlyLivingCost * durationMonths;

  const totalCost = netTuitionCost + financingCost + livingCost;

  // Salary gain across a five-year horizon with simple salary growth.
  const expectedFiveYearSalary = Array.from({ length: 5 }).reduce<number>((acc, _, index) => {
    return acc + avgCTC * Math.pow(1 + salaryGrowthRate / 100, index);
  }, 0);
  const salaryGain = expectedFiveYearSalary - currentSalary * 5 + internshipIncome;

  // Opportunity cost
  const opportunityCost = isOnline
    ? currentSalary * 0.2 * durationYears
    : currentSalary * durationYears;

  // Risk penalty
  const riskPenalty = totalCost * (1 - placementRate / 100);

  const netGain = salaryGain - totalCost - opportunityCost - riskPenalty;

  const roiScore = netGain / durationYears;

  // Payback Period (Months)
  // Simple payback = Total Cost / (Monthly Salary of the new role)
  const paybackMonths = avgCTC > 0 ? (totalCost / (avgCTC / 12)) : 99;
  const breakEvenYear = Number((paybackMonths / 12).toFixed(1));
  const inflationAdjustedCost = totalCost * Math.pow(1 + inflationRate / 100, durationYears);
  const netPresentValue = Math.round(netGain - (inflationAdjustedCost - totalCost));
  const affordabilityIndex = Number(
    Math.max(0, Math.min(100, 100 - (totalCost / Math.max(avgCTC, 1)) * 10)).toFixed(1)
  );

  return {
    roiScore,
    totalCost,
    netTuitionCost,
    financingCost,
    salaryGain,
    riskPenalty,
    opportunityCost,
    paybackMonths,
    paybackYears: Number((paybackMonths / 12).toFixed(1)),
    breakEvenYear,
    totalReturnsFiveYears: netGain,
    expectedFiveYearSalary,
    netPresentValue,
    affordabilityIndex,
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
