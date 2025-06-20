export { lookupBenchmarkTicker };

import { assetClassBenchmarks } from '../data/config';

function lookupBenchmarkTicker(assetClass) {
  const entry = assetClassBenchmarks[assetClass];
  return entry ? entry.ticker : null;
}
