import { calculateScores, METRICS_CONFIG } from '../scoring';

function scoreWithExcelSpec(funds) {
  const metrics = Object.keys(METRICS_CONFIG.weights);
  const byClass = {};
  funds.forEach(f => {
    if (!byClass[f.assetClass]) byClass[f.assetClass] = [];
    byClass[f.assetClass].push(f);
  });

  const results = [];
  Object.values(byClass).forEach(classFunds => {
    const stats = {};
    metrics.forEach(m => {
      const vals = classFunds.map(f => f[m]).filter(v => v != null);
      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
      const sd =
        vals.length > 1
          ? Math.sqrt(vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length)
          : 0;
      stats[m] = { mean, sd };
    });

    classFunds.forEach(f => {
      const raw = metrics.reduce((sum, m) => {
        const sd = stats[m].sd;
        if (f[m] == null || !sd) return sum;
        return sum + ((f[m] - stats[m].mean) / sd) * METRICS_CONFIG.weights[m];
      }, 0);
      const final = Math.max(0, Math.min(100, 50 + 10 * raw));
      results.push({ symbol: f.Symbol, final: Math.round(final) });
    });
  });
  return results;
}

test('scores align with Excel specification', () => {
  const sample = [
    {
      Symbol: 'AAA',
      assetClass: 'Large Cap',
      ytd: 0.1,
      oneYear: 0.2,
      threeYear: 0.15,
      fiveYear: 0.18,
      tenYear: 0.2,
      sharpeRatio3Y: 1,
      stdDev3Y: 15,
      stdDev5Y: 14,
      upCapture3Y: 105,
      downCapture3Y: 95,
      alpha5Y: 0.01,
      expenseRatio: 0.008,
      managerTenure: 5,
      YTD: 0.1,
      '1 Year': 0.2,
      '3 Year': 0.15,
      '5 Year': 0.18,
      '10 Year': 0.2,
      'Sharpe Ratio': 1,
      '3Y Std Dev': 15,
      '5Y Std Dev': 14,
      'Up Capture Ratio - 3Y': 105,
      'Down Capture Ratio - 3Y': 95,
      'Alpha - 5Y': 0.01,
      'Net Expense Ratio': 0.008,
      'Manager Tenure': 5,
    },
    {
      Symbol: 'BBB',
      assetClass: 'Large Cap',
      ytd: 0.08,
      oneYear: 0.18,
      threeYear: 0.13,
      fiveYear: 0.16,
      tenYear: 0.19,
      sharpeRatio3Y: 0.9,
      stdDev3Y: 16,
      stdDev5Y: 15,
      upCapture3Y: 102,
      downCapture3Y: 97,
      alpha5Y: 0.005,
      expenseRatio: 0.009,
      managerTenure: 4,
      YTD: 0.08,
      '1 Year': 0.18,
      '3 Year': 0.13,
      '5 Year': 0.16,
      '10 Year': 0.19,
      'Sharpe Ratio': 0.9,
      '3Y Std Dev': 16,
      '5Y Std Dev': 15,
      'Up Capture Ratio - 3Y': 102,
      'Down Capture Ratio - 3Y': 97,
      'Alpha - 5Y': 0.005,
      'Net Expense Ratio': 0.009,
      'Manager Tenure': 4,
    },
  ];

  const excel = scoreWithExcelSpec(sample);
  const app = calculateScores(sample).map(f => ({
    symbol: f.Symbol,
    final: f.scores.final,
  }));

  excel.forEach(e => {
    const a = app.find(x => x.symbol === e.symbol);
    expect(a.final).toBeCloseTo(e.final, 1);
  });
});

