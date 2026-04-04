---
description: Build or refine the 8-Year Wealth Projection engine
---

# 8-Year Wealth Projection Workflow

Use this workflow to build or refine the ROI calculation engine that projects a student's wealth over an 8-year period.

## Steps
1. **Analyze Input**: Gather `Total Investment` (Fees + Opportunity Cost) and `Average Salary after Placement`.
2. **Break-even Calculation**: Compute the time (in months/years) until the cumulative salary exceeds the total investment.
3. **8-Year Projection**: Calculate the projected wealth at the end of 8 years, accounting for typical salary hikes and loan interest (if applicable).
4. **Frontend Formatting**: 
   - Ensure the data is formatted into a clean, serializable object.
   - Use standard currency formatting (INR).
   - Provide "High", "Mid", and "Low" confidence scenarios.
5. **Secure Integration**: Ensure all calculations happen in a Server Component or a secure utility to prevent leak of proprietary logic.
