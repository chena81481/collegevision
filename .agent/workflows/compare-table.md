---
description: Build head-to-head comparison matrices
---

# Comparison Matrix Workflow

Use this workflow to build accessible, responsive tables for head-to-head university and course comparisons.

## Steps
1. **State Management**: Implement meticulous state management to track selected universities and their corresponding courses.
2. **Data Fetching**: Efficiently fetch detailed metrics for all selected entities in a single batch where possible.
3. **Table Scaffolding**:
   - Build a semantic, accessible HTML table structure.
   - Column 1: Feature Label.
   - Column 2..N: University Data.
4. **Highlighting Engines**:
   - Automatically highlight the **Lowest Fee**.
   - Automatically highlight the **Highest CTC**.
   - Ensure **Approvals** (UGC, AICTE) are clearly badge-highlighted.
5. **Mobile Optimization**:
   - Use a sticky feature column for horizontal scrolling on mobile.
   - Implement a "side-by-side card" view for 2-way mobile comparisons.
   - Ensure no content overflows or breaks the mobile viewport.
