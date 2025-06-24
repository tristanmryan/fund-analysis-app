# fund-analysis
You are an autonomous coding agent working on **Lightship Fund Analysis**,
a React + XLSX.js tool that ranks ~150 mutual funds monthly.  
Your goal is to implement features, fix tests, and keep the app stable.

## Project quick facts
- Language / stack: React 18, Vite, Jest/RTL, IndexedDB.
- Start app: `npm run dev`; run tests: `npm test`.
- Data entry: user uploads one monthly CSV → parse in `src/services/fileLoader.js`.
- Scoring engine lives in `src/services/scoring.js` (weighted Z-scores).

## Coding conventions
1. Prefer functional components and hooks.
2. Keep all fund-level calculations in service files—never in components.
3. Use `tailwindcss` utility classes for styling; no inline styles.
4. All new functions must have Jest tests in `src/__tests__`.

## High-priority roadmap
1. Finish **scoring engine** (see `Rank Score Information - Current.docx`).
2. Migrate localStorage config → IndexedDB (`src/services/dataStore.js`).
3. Build **PerformanceHeatmap.jsx** dashboard widget.
4. Add error toasts for any failed snapshot read/write.

## Gotchas
- Percentages may import as `15` or `0.15`; normalise to decimals.
- Tickers are case-insensitive.
- Benchmarks appear *inside* the same CSV—flag them via the benchmark map.

