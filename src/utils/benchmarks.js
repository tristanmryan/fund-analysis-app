export { lookupBenchmarkTicker, lookupBenchmark };

import { assetClassBenchmarks } from '../data/config';

function lookupBenchmarkTicker(assetClass) {
  const entry = assetClassBenchmarks[assetClass];
  return entry ? entry.ticker : null;
}

function lookupBenchmark(assetClass) {
  return lookupBenchmarkTicker(assetClass);
}
