// src/services/tagEngine.js

/**
 * Evaluate tag rules for scored funds.
 * @param {Array<Object>} funds
 * @returns {Array<Object>} funds with updated tags array
 */
export function applyTagRules(funds = []) {
  if (!Array.isArray(funds)) return [];

  const statsByClass = {};

  // collect metrics per asset class excluding benchmarks
  funds.forEach(f => {
    const cls = f.assetClass || f['Asset Class'] || 'Unknown';
    if (!statsByClass[cls]) {
      statsByClass[cls] = {
        expenseRatio: [],
        threeYear: [],
        fiveYear: [],
        stdDev5Y: [],
        sharpeRatio3Y: [],
        managerTenure: [],
        ytd: [],
        oneYear: []
      };
    }
    if (f.isBenchmark) return;
    const m = f.metrics || {};
    Object.keys(statsByClass[cls]).forEach(key => {
      const v = m[key];
      if (v != null && !isNaN(v)) statsByClass[cls][key].push(v);
    });
  });

  // calculate means and standard deviations
  const calcMean = arr => {
    if (!arr.length) return 0;
    return arr.reduce((s, v) => s + v, 0) / arr.length;
  };
  const calcSd = (arr, mean) => {
    if (arr.length <= 1) return 0;
    return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
  };

  const summaries = {};
  Object.entries(statsByClass).forEach(([cls, metrics]) => {
    summaries[cls] = {};
    Object.entries(metrics).forEach(([k, values]) => {
      const mean = calcMean(values);
      const sd = calcSd(values, mean);
      summaries[cls][k] = { mean, sd };
    });
  });

  return funds.map(fund => {
    const cls = fund.assetClass || fund['Asset Class'] || 'Unknown';
    const stats = summaries[cls] || {};
    const m = fund.metrics || {};
    const tags = [];

    const score = fund.scores?.final;
    if (typeof score === 'number' && score < 45) tags.push('Review');

    if (m.expenseRatio != null && stats.expenseRatio)
      if (m.expenseRatio > stats.expenseRatio.mean + stats.expenseRatio.sd)
        tags.push('Expensive');

    if (
      m.threeYear != null &&
      m.fiveYear != null &&
      stats.threeYear &&
      stats.fiveYear &&
      m.threeYear < stats.threeYear.mean &&
      m.fiveYear < stats.fiveYear.mean
    ) {
      tags.push('Underperf');
    }

    if (
      stats.stdDev5Y &&
      ((m.stdDev5Y != null && m.stdDev5Y > stats.stdDev5Y.mean + stats.stdDev5Y.sd) ||
        (m.sharpeRatio3Y != null &&
          stats.sharpeRatio3Y &&
          m.sharpeRatio3Y < stats.sharpeRatio3Y.mean - stats.sharpeRatio3Y.sd))
    ) {
      tags.push('High Risk');
    }

    if (m.managerTenure != null && m.managerTenure < 3) tags.push('Tenure Low');

    if (
      stats.stdDev5Y &&
      stats.sharpeRatio3Y &&
      m.stdDev5Y != null &&
      m.sharpeRatio3Y != null &&
      m.stdDev5Y < stats.stdDev5Y.mean - stats.stdDev5Y.sd &&
      m.sharpeRatio3Y > stats.sharpeRatio3Y.mean + 0.5 * stats.sharpeRatio3Y.sd
    ) {
      tags.push('Consistent');
    }

    if (
      stats.ytd &&
      stats.oneYear &&
      m.ytd != null &&
      m.oneYear != null &&
      m.ytd > stats.ytd.mean + stats.ytd.sd &&
      m.oneYear > stats.oneYear.mean + stats.oneYear.sd
    ) {
      tags.push('Momentum');
    }

    if (
      stats.ytd &&
      m.ytd != null &&
      m.ytd > stats.ytd.mean + stats.ytd.sd &&
      ((stats.threeYear && m.threeYear != null && m.threeYear < stats.threeYear.mean) ||
        (stats.fiveYear && m.fiveYear != null && m.fiveYear < stats.fiveYear.mean))
    ) {
      tags.push('Turnaround?');
    }

    return { ...fund, tags };
  });
}
