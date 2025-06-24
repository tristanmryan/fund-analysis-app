import { getScoreLabel, getScoreColor } from '../scoreTags';

test('score label bands', () => {
  expect(getScoreLabel(65)).toBe('Strong');
  expect(getScoreLabel(57)).toBe('Healthy');
  expect(getScoreLabel(50)).toBe('Neutral');
  expect(getScoreLabel(42)).toBe('Caution');
  expect(getScoreLabel(30)).toBe('Weak');
});

test('score colors', () => {
  expect(getScoreColor(65)).toBe('#16a34a');
  expect(getScoreColor(57)).toBe('#22c55e');
  expect(getScoreColor(50)).toBe('#6b7280');
  expect(getScoreColor(42)).toBe('#eab308');
  expect(getScoreColor(30)).toBe('#dc2626');
});
