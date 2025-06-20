export const fmtPct = (v, digits = 2) =>
  v === null || isNaN(v) ? 'N/A' : `${Number(v).toFixed(digits)} %`;

export const fmtNumber = v =>
  v === null || isNaN(v) ? 'N/A' : Number(v).toFixed(2);

export function formatPercent(value, digits = 2) {
  return fmtPct(value, digits);
}
