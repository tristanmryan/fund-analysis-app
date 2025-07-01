import { lookupBenchmarkTicker, lookupBenchmark } from '@/utils/benchmarks';

test('lookupBenchmarkTicker returns correct symbol', () => {
  expect(lookupBenchmarkTicker('Large Cap Growth')).toBe('IWF');
});

test('lookupBenchmark returns same symbol', () => {
  expect(lookupBenchmark('Large Cap Growth')).toBe('IWF');
});
