import { applyTagRules } from '../tagEngine';

describe('tag engine rules', () => {
  const peer1 = {
    Symbol: 'P1',
    assetClass: 'X',
    metrics: {
      expenseRatio: 0.5,
      threeYear: 10,
      fiveYear: 10,
      stdDev5Y: 14,
      sharpeRatio3Y: 1,
      managerTenure: 5,
      ytd: 5,
      oneYear: 8
    },
    scores: { final: 50 }
  };

  const peer2 = {
    Symbol: 'P2',
    assetClass: 'X',
    metrics: {
      expenseRatio: 0.6,
      threeYear: 11,
      fiveYear: 11,
      stdDev5Y: 16,
      sharpeRatio3Y: 1.2,
      managerTenure: 6,
      ytd: 6,
      oneYear: 9
    },
    scores: { final: 55 }
  };

  function getTags(candidate) {
    const res = applyTagRules([peer1, peer2, candidate]);
    return res.find(f => f.Symbol === candidate.Symbol).tags;
  }

  test('Review', () => {
    const c = {
      Symbol: 'C',
      assetClass: 'X',
      metrics: { ...peer1.metrics },
      scores: { final: 40 }
    };
    expect(getTags(c)).toContain('Review');
  });

  test('Expensive', () => {
    const c = {
      Symbol: 'C',
      assetClass: 'X',
      metrics: { ...peer1.metrics, expenseRatio: 0.7 },
      scores: { final: 50 }
    };
    expect(getTags(c)).toContain('Expensive');
  });

  test('Underperf', () => {
    const c = {
      Symbol: 'C',
      assetClass: 'X',
      metrics: { ...peer1.metrics, threeYear: 9, fiveYear: 9 },
      scores: { final: 50 }
    };
    expect(getTags(c)).toContain('Underperf');
  });

  test('High Risk', () => {
    const c = {
      Symbol: 'C',
      assetClass: 'X',
      metrics: { ...peer1.metrics, stdDev5Y: 17 },
      scores: { final: 50 }
    };
    expect(getTags(c)).toContain('High Risk');
  });

  test('Tenure Low', () => {
    const c = {
      Symbol: 'C',
      assetClass: 'X',
      metrics: { ...peer1.metrics, managerTenure: 2 },
      scores: { final: 50 }
    };
    expect(getTags(c)).toContain('Tenure Low');
  });

  test('Consistent', () => {
    const c = {
      Symbol: 'C',
      assetClass: 'X',
      metrics: { ...peer1.metrics, stdDev5Y: 13, sharpeRatio3Y: 1.3 },
      scores: { final: 50 }
    };
    expect(getTags(c)).toContain('Consistent');
  });

  test('Momentum', () => {
    const c = {
      Symbol: 'C',
      assetClass: 'X',
      metrics: { ...peer1.metrics, ytd: 7, oneYear: 10 },
      scores: { final: 50 }
    };
    expect(getTags(c)).toContain('Momentum');
  });

  test('Turnaround?', () => {
    const c = {
      Symbol: 'C',
      assetClass: 'X',
      metrics: { ...peer1.metrics, ytd: 7, oneYear: 9, threeYear: 9 },
      scores: { final: 50 }
    };
    expect(getTags(c)).toContain('Turnaround?');
  });
});
