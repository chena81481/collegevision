/**
 * CollegeVision – Advanced ROI & Payback Calculator
 */

export interface ROICalculation {
  paybackYears: number;
  totalInvestment: number;
  totalReturnsFiveYears: number;
}

export function calculateROI(
  tuitionFee: number,
  livingCost: number,
  scholarship: number,
  avgStartingSalary: number, // Annual
  yearsOfStudy: number = 2
): ROICalculation {
  const annualCost = tuitionFee + livingCost - scholarship;
  const totalInvestment = annualCost * yearsOfStudy;
  
  // Assuming 20% growth in salary YOY and 10% tax/expenses from disposable income
  // Very simplified for demonstration
  const monthlyDisposable = (avgStartingSalary / 12) * 0.6; // 60% disposable income
  const annualDisposable = monthlyDisposable * 12;
  
  const paybackYears = annualDisposable > 0 ? totalInvestment / annualDisposable : 99;
  
  // Total returns over 5 years (Salaries - Investment)
  let totalSalary = 0;
  let currentSalary = avgStartingSalary;
  for (let i = 0; i < 5; i++) {
    totalSalary += currentSalary;
    currentSalary *= 1.1; // 10% raise
  }
  
  const totalReturnsFiveYears = totalSalary - totalInvestment;

  return {
    paybackYears: Number(paybackYears.toFixed(1)),
    totalInvestment,
    totalReturnsFiveYears
  };
}

/** Formats a raw ROI number for display, e.g. 433 → "433%" */
export function formatROI(roi: number | null): string {
  if (roi === null) return "N/A";
  return `${roi}%`;
}

/** Formats a fee in INR for display, e.g. 175000 → "₹1,75,000" */
export function formatFeeINR(fee: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(fee);
}
