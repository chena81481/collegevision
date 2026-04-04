# Thread Isolation Strategy

## Directive
When handling major updates to the platform, development must be divided into isolated focus areas (Threads) to prevent context bloat and ensure high precision for core engines.

## Active Threads
### Thread A: The Matcher (Backend Logic)
- **Focus**: Purely on the AI-Powered Discovery Match backend.
- **Inputs**: User budget, weekly time commitment, current skill sets.
- **Logic**: Querying Supabase for the top 3-5 university fits with 94%+ mathematical accuracy.
- **Output**: Pure data/JSON for the frontend to consume.

### Thread B: The Directory (Frontend/SEO)
- **Focus**: Building static, SEO-optimized university directory pages.
- **Goal**: Drive organic traffic and provide deep-dive information for every listed institution.
- **Logic**: Static generation (SSG), JSON-LD schemas, and competitive content structure.
- **Output**: High-performance, crawlable web pages.

## Constraints
- Avoid mixing "Matcher" logic changes with "Directory" layout changes in the same tool call or file edit where possible.
- Each thread should have its own validation and testing phase.
