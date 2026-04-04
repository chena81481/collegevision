---
name: Indian Financial Context
description: Standards for Indian currency formatting, conversions, and loan structures.
---

# Indian Financial Context Skill

This skill ensures that all pricing blocks, ROI calculations, and salary metrics use the correct Indian financial formatting and logic.

## Currency & Formatting
- **Symbol**: Always use `₹` (Indian Rupee).
- **Number System**: Use the Indian numbering system (Lakh/Crore) for display.
  - **Lakh (L)**: 1,00,000 (e.g., ₹6.5L).
  - **Crore (Cr)**: 1,00,00,000 (e.g., ₹1.2Cr).
- **Salary (LPA)**: Salaries should be expressed in "Lakhs Per Annum" (e.g., 10.5 LPA).

## Financial Logic
- **Zero Cost EMI**: 
  - Represents a loan where the interest is subvented by the university.
  - The student pays: `Total Fee / Tenure Months`.
  - Format: "Starting at ₹8,400/month (No-Cost EMI available)."
- **ROI (Return on Investment)**:
  - Calculated as `Avg CTC / Total Course Fee`.
  - Display as a multiplier (e.g., 4.2x ROI).
- **Break-even**:
  - The time it takes for new salary to cover the course investment.
  - Typically expressed in "Months of Salary."

## Guardrails
- **Currency**: Never use `$` or `USD` unless explicitly requested for international students.
- **Formatting**: Ensure commas follow the `10,00,000` (Indian) pattern, not `1,000,000` (Western).
