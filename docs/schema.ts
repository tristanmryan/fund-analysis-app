/* ---------------------------------------------------------------------------
 * docs/schema.ts
 * ---------------------------------------------------------------------------
 * Single source‑of‑truth for CSV headers and TypeScript interfaces used by the
 * Lightship Fund Analysis app.  Import from this file instead of hard‑coding
 * column names so Codex (and humans!) stop guessing.
 * ---------------------------------------------------------------------------*/

/** Header list for the *current* monthly performance CSV exported from Raymond James. */
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
  
  /** Header list for historical monthly performance CSVs downloaded from YCharts. */
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
  
  /** Convenience tuple‑union type of **all** known header texts. */
  export type KnownCsvHeader = typeof CURRENT_PERFORMANCE_HEADERS[number] | typeof HISTORICAL_PERFORMANCE_HEADERS[number];
  
  /** Basic metric payload shared by both current + historical records. */
  export interface FundMetrics {
    symbolCusip: string;
    // Optional fields below – presence depends on file type and data maturity
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
  
  /**
   * Detects the file type based on presence of distinguishing headers.
   * Returns "current" | "historical" for caller logic.
   */
  export function getPerformanceFileKind(headers: readonly string[]): "current" | "historical" {
    return headers.includes("Product Name") ? "current" : "historical";
  }
  