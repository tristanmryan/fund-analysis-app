export const SCORE_BANDS = [
  { min: 60, label: 'Strong', color: '#16a34a' },
  { min: 55, label: 'Healthy', color: '#22c55e' },
  { min: 45, label: 'Neutral', color: '#6b7280' },
  { min: 40, label: 'Caution', color: '#eab308' },
  { min: 0,  label: 'Weak', color: '#dc2626' }
];

export function getScoreInfo(score = 0) {
  for (const band of SCORE_BANDS) {
    if (score >= band.min) return band;
  }
  return SCORE_BANDS[SCORE_BANDS.length - 1];
}

export function getScoreColor(score) {
  return getScoreInfo(score).color;
}

export function getScoreLabel(score) {
  return getScoreInfo(score).label;
}
