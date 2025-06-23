import { ensureBenchmarkRows } from '../dataLoader';

test('ensureBenchmarkRows adds benchmarks when list empty', () => {
  const result = ensureBenchmarkRows([]);
  expect(result.length).toBeGreaterThan(0);
  expect(result[0].isBenchmark).toBe(true);
});

test('existing benchmark row retains its asset class', () => {
  const list = [
    {
      symbol: 'IWF',
      name: 'iShares Russell 1000 Growth',
      assetClass: 'Large Cap Growth',
      'Asset Class': 'Large Cap Growth',
    },
  ];
  const result = ensureBenchmarkRows(list);
  const fund = result.find(r => r.symbol === 'IWF');
  expect(fund.assetClass).toBe('Large Cap Growth');
  expect(fund['Asset Class']).toBe('Large Cap Growth');
  expect(fund.isBenchmark).toBe(true);
});
