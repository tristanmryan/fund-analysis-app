import { calculateScores } from '../scoring';

describe('VFIAX scoring', () => {
  test('VFIAX percentile between 40 and 60 in Large Cap Blend', () => {
    const sample = [
      {
        Symbol: 'AAA',
        'Fund Name': 'Fund A',
        assetClass: 'Large Cap Blend',
        '1 Year': 12,
        '3 Year': 14,
        '5 Year': 16,
        'Sharpe Ratio': 1.2,
        'Standard Deviation': 15,
        'Net Expense Ratio': 0.5
      },
      {
        Symbol: 'BBB',
        'Fund Name': 'Fund B',
        assetClass: 'Large Cap Blend',
        '1 Year': 8,
        '3 Year': 9,
        '5 Year': 10,
        'Sharpe Ratio': 0.8,
        'Standard Deviation': 18,
        'Net Expense Ratio': 0.6
      },
      {
        Symbol: 'CCC',
        'Fund Name': 'Fund C',
        assetClass: 'Large Cap Blend',
        '1 Year': 9,
        '3 Year': 11,
        '5 Year': 12,
        'Sharpe Ratio': 0.9,
        'Standard Deviation': 16,
        'Net Expense Ratio': 0.4
      },
      {
        Symbol: 'VFIAX',
        'Fund Name': 'Vanguard 500 Index Admiral',
        assetClass: 'Large Cap Blend',
        '1 Year': 10,
        '3 Year': 12,
        '5 Year': 14,
        'Sharpe Ratio': 1.0,
        'Standard Deviation': 15.5,
        'Net Expense Ratio': 0.05
      },
      {
        Symbol: 'IWB',
        'Fund Name': 'Russell 1000',
        assetClass: 'Large Cap Blend',
        '1 Year': 11,
        '3 Year': 13,
        '5 Year': 15,
        'Sharpe Ratio': 1.1,
        'Standard Deviation': 16,
        'Net Expense Ratio': 0.2,
        isBenchmark: true
      }
    ];

    const scored = calculateScores(sample);
    const vfiax = scored.find(f => f.Symbol === 'VFIAX');
    expect(vfiax.scores.percentile).toBeGreaterThanOrEqual(40);
    expect(vfiax.scores.percentile).toBeLessThanOrEqual(60);
  });
});
