# React Server Components (RSC) First

## Rule
By default, all new components in the `src/app` directory must be **Server Components**.

## Constraints
- Do NOT use `"use client"` unless the component requires:
  - React hooks (`useState`, `useEffect`, `useContext`, etc.)
  - Event listeners (e.g., `onClick`)
  - Browser-only APIs (e.g., `window`, `localStorage`)
  - Third-party libraries that rely on client-side React
- Interactive elements (e.g., sliders, complex forms, modals) should be extracted into small, focused client components and imported into Server Components.
- Data fetching should be performed in Server Components using `fetch` or direct database calls where possible.
