import { getClassesWhereBenchmarkLeads } from '@/selectors/benchmarkLead';

describe('getClassesWhereBenchmarkLeads', () => {
  const sample = [
    { assetClass: 'Large Cap', Symbol: 'IWF', isBenchmark: true, scores: { final: 80 } },
    { assetClass: 'Large Cap', Symbol: 'AAA', isBenchmark: false, scores: { final: 50 } },
    { assetClass: 'Large Cap', Symbol: 'BBB', isBenchmark: false, scores: { final: 60 } },
    { assetClass: 'Large Cap', Symbol: 'CCC', isBenchmark: false, scores: { final: 55 } },
    { assetClass: 'Large Cap', Symbol: 'DDD', isBenchmark: false, scores: { final: 70 } },
    { assetClass: 'Small Cap', Symbol: 'IWM', isBenchmark: true, scores: { final: 55 } },
    { assetClass: 'Small Cap', Symbol: 'EEE', isBenchmark: false, scores: { final: 50 } },
    { assetClass: 'Small Cap', Symbol: 'FFF', isBenchmark: false, scores: { final: 48 } }
  ];

  test('detects benchmark lead with default threshold', () => {
    const result = getClassesWhereBenchmarkLeads(sample, 10);
    expect(result).toEqual([
      {
        assetClass: 'Large Cap',
        benchmarkSymbol: 'IWF',
        benchmarkScore: 80,
        medianPeerScore: 57.5,
        gap: 22.5
      }
    ]);
  });

  test('respects custom threshold', () => {
    const result = getClassesWhereBenchmarkLeads(sample, 25);
    expect(result).toEqual([]);
  });
});
