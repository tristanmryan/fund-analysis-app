export function getClassesWhereBenchmarkLeads(funds, gapThreshold = 5) {
  if (!Array.isArray(funds)) return [];
  const byClass = {};
  funds.forEach(f => {
    const cls = f.assetClass;
    if (!cls) return;
    if (!byClass[cls]) byClass[cls] = [];
    byClass[cls].push(f);
  });

  const median = values => {
    const nums = values.filter(v => v != null && !isNaN(v)).sort((a, b) => a - b);
    if (nums.length === 0) return 0;
    const mid = Math.floor(nums.length / 2);
    if (nums.length % 2) return nums[mid];
    return (nums[mid - 1] + nums[mid]) / 2;
  };

  const results = [];

  Object.entries(byClass).forEach(([assetClass, items]) => {
    const benchmark = items.find(f => f.isBenchmark && f.scores);
    const peers = items.filter(f => !f.isBenchmark && f.scores);
    if (!benchmark || peers.length < 3) return;

    const peerScores = peers.map(p => p.scores.final);
    if (peerScores.length === 0) return;

    const medianPeerScore = median(peerScores);
    const benchmarkScore = benchmark.scores.final;
    const gap = benchmarkScore - medianPeerScore;
    if (gap >= gapThreshold) {
      results.push({
        assetClass,
        benchmarkSymbol: benchmark.Symbol,
        benchmarkScore: Math.round(benchmarkScore * 10) / 10,
        medianPeerScore: Math.round(medianPeerScore * 10) / 10,
        gap: Math.round(gap * 10) / 10
      });
    }
  });

  return results;
}

