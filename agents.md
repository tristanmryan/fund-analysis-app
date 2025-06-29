# Lightship Fund Analysis — **Single‑Source Guide for Codex**

> **READ THIS FIRST** before modifying or creating any files.

---

## 1  Bootstrapping Commands

| Purpose              | Command             |
| -------------------- | ------------------- |
| Dev server           | `npm run dev`       |
| Unit + RTL tests     | `npm test`          |
| Type‑check (no emit) | `npm run typecheck` |
| Lint fix             | `npm run lint:fix`  |

Codex **must** run the **test + typecheck + lint** trio and ship green CI before concluding a task.

---

## 2  Folder Landmarks

| Path              | What belongs here                              |
| ----------------- | ---------------------------------------------- |
| `src/components/` | React UI (functional, hooks only)              |
| `src/services/`   | Pure logic & parsers — no JSX                  |
| `src/context/`    | Global state using React Context               |
| `src/utils/`      | Tiny pure helpers; keep unit‑tested            |
| `src/styles/`     | Tailwind layer overrides only                  |
| `docs/schema.ts`  | **Authoritative types & CSV headers** (see §4) |

> **Imports** — use the `@/` alias from `tsconfig.json` (absolute paths). No relative `../../..` spelunking.

---

## 3  Code Conventions

1. **React**  ▪ Functional components + hooks; never class comps.
2. **Styling** ▪ Tailwind utility classes; no inline styles.
3. **Types**   ▪ Strict — no `any`; import types from `docs/schema.ts`.
4. **Tests**   ▪ Jest + RTL for every new function/component. **Never generate new snapshot tests unless explicitly asked.**
5. **Commits** ▪ Conventional Commits style → `feat(ui): add TrendChart`.
6. **Data safety** ▪ Preserve original upload; write computed values to new fields, never mutate source rows.

---

## 4  Data Schema (import from here!)

```ts
// docs/schema.ts  – AUTO‑GENERATED SOURCE‑OF‑TRUTH
export const CURRENT_PERFORMANCE_HEADERS = [
  "Symbol/CUSIP",
  "Product Name",
  "Fund Family Name",
  "Morningstar Star Rating",
  "Total Return - YTD (%)",
  "Category Rank (%) Total Return – YTD",
  "Total Return - 1 Year (%)",
  "Category Rank (%) Total Return – 1Y",
  "Annualized Total Return - 3 Year (%)",
  "Category Rank (%) Ann. Total Return – 3Y",
  "Annualized Total Return - 5 Year (%)",
  "Category Rank (%) Ann. Total Return – 5Y",
  "Annualized Total Return - 10 Year (%)",
  "Category Rank (%) Ann. Total Return – 10Y",
  "Alpha (Asset Class) - 5 Year",
  "Standard Deviation - 5 Year",
  "Up Capture Ratio (Morningstar Standard) - 3 Year",
  "Down Capture Ratio (Morningstar Standard) - 3 Year",
  "SEC Yield (%)",
  "Sharpe Ratio - 3 Year",
  "Standard Deviation - 3 Year",
  "Net Exp Ratio (%)",
  "Longest Manager Tenure (Years)"
] as const;

export const HISTORICAL_PERFORMANCE_HEADERS = [
  "Symbol/CUSIP",
  "Total Return - YTD (%)",
  "Total Return - 1 Year (%)",
  "Annualized Total Return - 3 Year (%)",
  "Annualized Total Return - 5 Year (%)",
  "Annualized Total Return - 10 Year (%)",
  "Alpha (Asset Class) - 5 Year",
  "Standard Deviation - 5 Year",
  "Up Capture Ratio (Morningstar Standard) - 3 Year",
  "Down Capture Ratio (Morningstar Standard) - 3 Year",
  "SEC Yield (%)",
  "Sharpe Ratio - 3 Year",
  "Standard Deviation - 3 Year",
  "Net Exp Ratio (%)",
  "Longest Manager Tenure (Years)"
] as const;

export interface FundMetrics {
  symbolCusip: string;
  productName?: string;
  fundFamilyName?: string;
  starRating?: number;
  ytd?: number;
  ytdRank?: number;
  oneYear?: number;
  oneYearRank?: number;
  threeYear?: number;
  threeYearRank?: number;
  fiveYear?: number;
  fiveYearRank?: number;
  tenYear?: number;
  tenYearRank?: number;
  alpha5Y?: number;
  stdDev5Y?: number;
  upCapture3Y?: number;
  downCapture3Y?: number;
  secYield?: number;
  sharpe3Y?: number;
  stdDev3Y?: number;
  expenseRatio?: number;
  managerTenure?: number;
}
```

**Parser rule:** detect file type via the presence of `Product Name` column.
If found → treat as *Current Monthly*; else assume *Historical*.

---

## 5  Pitfalls Codex MUST Avoid

* **DO NOT** invent column names — import headers above.
* **DO NOT** touch `localStorage` — use `src/services/dataStore.ts` (IndexedDB wrapper).
* **DO NOT** add new tests unless asked.
* Case‑insensitive ticker matching (`VOO` ≡ `voo`).

---

## 6  Task Checklist (every PR)

1. ✅ `npm test`
2. ✅ `npm run typecheck`
3. ✅ `npm run lint:fix`
4. Add concise PR body → *What & How to Test.*

If any step fails, **fix before concluding**.

---

## 7  ASK‑Prompt Template (copy ✂️ & fill)

```text
<Goal in one sentence>

Context:
- React 18 + Vite + Tailwind.
- Data types in docs/schema.ts.

Need:
1. Explain root cause of ____.
2. Draft a 3‑step fix — no code yet.

Respond only with: PLAN READY + the plan.
```

---

### End of guide — Happy Shipping! 🚀
