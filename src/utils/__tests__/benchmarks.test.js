import { lookupBenchmarkTicker } from '../benchmarks';

test('lookupBenchmarkTicker returns correct symbol', () => {
  expect(lookupBenchmarkTicker('Large Cap Growth')).toBe('IWF');
});
