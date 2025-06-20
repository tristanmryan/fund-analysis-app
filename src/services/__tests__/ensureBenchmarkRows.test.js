import { ensureBenchmarkRows } from '../dataLoader';

test('ensureBenchmarkRows adds benchmarks when list empty', () => {
  const result = ensureBenchmarkRows([]);
  expect(result.length).toBeGreaterThan(0);
  expect(result[0].isBenchmark).toBe(true);
});
