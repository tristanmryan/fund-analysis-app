import { calculateScores, generateClassSummary } from '@/services/scoring';

describe('per-class scoring with benchmark integration', () => {
  test('benchmark scored within its asset class', () => {
    const sample = [
      {
        Symbol: 'AAA',
        fundName: 'Fund A',
        assetClass: 'Large Cap Growth',
        oneYear: 12,
        threeYear: 14,
        fiveYear: 16,
        sharpe3Y: 1.2,
        stdDev5Y: 15,
        expenseRatio: 0.5,
        isBenchmark: false
      },
      {
        Symbol: 'BBB',
        fundName: 'Fund B',
        assetClass: 'Large Cap Growth',
        oneYear: 8,
        threeYear: 9,
        fiveYear: 10,
        sharpe3Y: 0.8,
        stdDev5Y: 18,
        expenseRatio: 0.6,
        isBenchmark: false
      },
      {
        Symbol: 'IWF',
        fundName: 'Russell 1000 Growth',
        assetClass: 'Large Cap Growth',
        oneYear: 10,
        threeYear: 11,
        fiveYear: 12,
        sharpe3Y: 1.0,
        stdDev5Y: 16,
        expenseRatio: 0.2,
        isBenchmark: true
      }
    ];

    const scored = calculateScores(sample);
    const summary = generateClassSummary(scored);
    const benchmark = scored.find(f => f.isBenchmark);

    expect(scored.filter(r => r.isBenchmark).length).toBeGreaterThan(0);
    expect(typeof benchmark.scores.final).toBe('number');
    expect(summary.benchmarkScore).toBeCloseTo(benchmark.scores.final, 1);
    expect(summary.fundCount).toBe(2); // peers only
  });
});
