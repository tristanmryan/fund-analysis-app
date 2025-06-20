export function formatPercent(value, digits = 2) {
  if (value == null || isNaN(value)) return 'N/A';
  return `${Number(value).toFixed(digits)}%`;
}
