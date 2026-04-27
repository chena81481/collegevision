export const INTENT_KEYWORDS = {
  degree: ['mba', 'mca', 'bba', 'bca', 'b.sc', 'm.sc', 'b.com', 'm.com'],
  budget: ['budget', 'lakh', 'under', 'cheap', 'affordable', '₹'],
  finance: ['emi', 'loan', 'scholarship', 'zero cost'],
  career: ['data science', 'cyber', 'marketing', 'hr', 'finance', 'tech', 'management']
};

export function parseIntentFromQuery(query: string) {
  const normalized = query.toLowerCase();
  const tokens: { type: string; value: string }[] = [];

  // Check Degree
  const degreeMatch = INTENT_KEYWORDS.degree.find(k => normalized.includes(k));
  if (degreeMatch) tokens.push({ type: 'Degree', value: degreeMatch.toUpperCase() });

  // Check Budget
  const budgetMatch = normalized.match(/(\d+)\s*(l|lakh|k)/i);
  if (budgetMatch || INTENT_KEYWORDS.budget.some(k => normalized.includes(k))) {
    tokens.push({ type: 'Budget', value: budgetMatch ? `< ₹${budgetMatch[0]}` : 'Optimized' });
  }

  // Check Finance
  const financeMatch = INTENT_KEYWORDS.finance.find(k => normalized.includes(k));
  if (financeMatch) tokens.push({ type: 'Finance', value: financeMatch.toUpperCase() });

  // Check Career
  const careerMatch = INTENT_KEYWORDS.career.find(k => normalized.includes(k));
  if (careerMatch) tokens.push({ type: 'Career', value: careerMatch });

  return tokens;
}
