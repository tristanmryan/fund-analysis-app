import { calculateScores, generateClassSummary } from '../scoring';

describe('per-class scoring with benchmark integration', () => {
  test('benchmark scored within its asset class', () => {
    const sample = [
      {
        Symbol: 'AAA',
        'Fund Name': 'Fund A',
        assetClass: 'Large Cap Growth',
        '1 Year': 12,
        '3 Year': 14,
        '5 Year': 16,
        'Sharpe Ratio': 1.2,
        'Standard Deviation': 15,
        'Net Expense Ratio': 0.5,
        isBenchmark: false
      },
      {
        Symbol: 'BBB',
        'Fund Name': 'Fund B',
        assetClass: 'Large Cap Growth',
        '1 Year': 8,
        '3 Year': 9,
        '5 Year': 10,
        'Sharpe Ratio': 0.8,
        'Standard Deviation': 18,
        'Net Expense Ratio': 0.6,
        isBenchmark: false
      },
      {
        Symbol: 'IWF',
        'Fund Name': 'Russell 1000 Growth',
        assetClass: 'Large Cap Growth',
        '1 Year': 10,
        '3 Year': 11,
        '5 Year': 12,
        'Sharpe Ratio': 1.0,
        'Standard Deviation': 16,
        'Net Expense Ratio': 0.2,
        isBenchmark: true
      }
    ];

    const scored = calculateScores(sample);
    const summary = generateClassSummary(scored);
    const benchmark = scored.find(f => f.isBenchmark);

    expect(typeof benchmark.scores.final).toBe('number');
    expect(summary.benchmarkScore).toBeCloseTo(benchmark.scores.final);
    expect(summary.fundCount).toBe(2); // peers only
  });
});
