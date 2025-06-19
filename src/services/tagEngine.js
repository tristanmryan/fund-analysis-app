// src/services/tagEngine.js

/**
 * Apply automatic tagging rules to scored funds.
 * @param {Array<Object>} funds - Array of fund objects with metrics and scores.
 * @param {Object} config - App configuration (may contain benchmark info).
 * @returns {Array<Object>} New array of funds with updated `tags` arrays.
 */
export function applyTagRules(funds, config = {}) {
  if (!Array.isArray(funds)) return [];

  const expenseAvgByClass = {};
  const stdAvgByClass = {};

  funds.forEach(fund => {
    const assetClass = fund['Asset Class'] || fund.assetClass || 'Unknown';
    if (!expenseAvgByClass[assetClass]) expenseAvgByClass[assetClass] = [];
    if (!stdAvgByClass[assetClass]) stdAvgByClass[assetClass] = [];

    const er = fund.metrics?.expenseRatio;
    if (er != null && !isNaN(er)) expenseAvgByClass[assetClass].push(er);

    const sd = fund.metrics?.stdDev5Y;
    if (sd != null && !isNaN(sd)) stdAvgByClass[assetClass].push(sd);
  });

  Object.keys(expenseAvgByClass).forEach(ac => {
    const vals = expenseAvgByClass[ac];
    expenseAvgByClass[ac] =
      vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  });

  Object.keys(stdAvgByClass).forEach(ac => {
    const vals = stdAvgByClass[ac];
    stdAvgByClass[ac] =
      vals.length > 0 ? vals.reduce((s, v) => s + v, 0) / vals.length : null;
  });

  const benchmarkSharpe = {};
  funds.forEach(fund => {
    if (fund.isBenchmark) {
      const assetClass = fund['Asset Class'] || fund.assetClass || 'Unknown';
      const sharpe = fund.metrics?.sharpeRatio3Y;
      if (sharpe != null && !isNaN(sharpe)) {
        benchmarkSharpe[assetClass] = sharpe;
      }
    }
  });

  return funds.map(fund => {
    const assetClass = fund['Asset Class'] || fund.assetClass || 'Unknown';
    const tags = new Set(Array.isArray(fund.tags) ? fund.tags : []);

    const score = fund.scores?.final;
    if (typeof score === 'number') {
      if (score < 40) tags.add('underperformer');
      if (score >= 70) tags.add('outperformer');
    }

    const expense = fund.metrics?.expenseRatio;
    const classAvgExpense = expenseAvgByClass[assetClass];
    if (
      expense != null &&
      classAvgExpense != null &&
      expense > classAvgExpense * 1.5
    ) {
      tags.add('expensive');
    }

    const stdDev = fund.metrics?.stdDev5Y;
    const classAvgStd = stdAvgByClass[assetClass];
    if (
      stdDev != null &&
      classAvgStd != null &&
      stdDev > classAvgStd * 1.2
    ) {
      tags.add('high-risk');
    }

    const sharpe = fund.metrics?.sharpeRatio3Y;
    const benchSharpe = benchmarkSharpe[assetClass];
    if (
      sharpe != null &&
      benchSharpe != null &&
      sharpe < benchSharpe * 0.8
    ) {
      tags.add('review-needed');
    }

    return { ...fund, tags: Array.from(tags) };
  });
}
