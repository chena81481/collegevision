import { z } from 'zod';

export const MatcherSchema = z.object({
  budget: z.number().min(0),
  weeklyHours: z.number().min(1).max(168),
  skills: z.array(z.string()).default([]),
  targetLevel: z.enum(['UG', 'PG', 'EXECUTIVE']).optional(),
  statePreference: z.string().optional(),
});

export type MatcherInput = z.infer<typeof MatcherSchema>;

export interface MatchResult {
  courseId: string;
  universityName: string;
  courseName: string;
  totalFee: number;
  avgCtc: number;
  roiScore: number;
  matchScore: number; // 0 to 100
  matchInsights: string[];
}

/**
 * findBestMatches logic:
 * 1. Budget Score: How well does the course fee fit the user's budget?
 * 2. ROI Score: Ratio of Salary to Fee (Normalised).
 * 3. Time Score: Is the course duration/commitment viable for the user?
 * 4. Skill Relevance: Does the course curriculum align with the user's target skills?
 */
export function calculateMatchScore(course: any, input: MatcherInput): number {
  let score = 0;

  // 1. Budget Alignment (Weight: 40%)
  // If fee is within budget, full points. If slightly over, partial.
  if (course.total_fee_inr <= input.budget) {
    score += 40;
  } else if (course.total_fee_inr <= input.budget * 1.25) {
    score += 25; // Over budget but within "stretch" zone
  }

  // 2. ROI Performance (Weight: 30%)
  const roi = course.avg_ctc_inr / course.total_fee_inr;
  // Normalise ROI: 1.0x to 5.0x mapped to 0 to 30 points
  const normalizedRoiScore = Math.min(Math.max((roi - 1) / 4 * 30, 0), 30);
  score += normalizedRoiScore;

  // 3. Level Matching (Weight: 20%)
  if (input.targetLevel && course.degree_level === input.targetLevel) {
    score += 20;
  } else if (!input.targetLevel) {
    score += 15; // Neutral
  }

  // 4. Strategic Bonus (Weight: 10%)
  // e.g. State preference or Zero-Cost EMI
  if (input.statePreference && course.university?.state === input.statePreference) {
    score += 5;
  }
  if (course.has_zero_cost_emi) {
    score += 5;
  }

  return Math.round(score);
}

export function generateInsights(course: any, score: number): string[] {
  const insights = [];
  const roi = (course.avg_ctc_inr / course.total_fee_inr).toFixed(1);
  
  if (score > 90) insights.push("🔥 Perfection: Direct alignment with your budget and career goals.");
  if (parseFloat(roi) > 3.5) insights.push(`🚀 High ROI: Return of ${roi}x your investment.`);
  if (course.has_zero_cost_emi) insights.push("💳 Financial Edge: Available at 0% interest EMI.");
  
  return insights;
}
