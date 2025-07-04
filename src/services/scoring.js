// src/services/scoring.js

/**
 * Core Scoring Engine for Lightship Fund Analysis
 * Implements weighted Z-score ranking system within asset classes
 */

import { getScoreColor, getScoreLabel } from '@/utils/scoreTags';
import { CURRENT_PERFORMANCE_HEADERS as CUR } from '@/docs/schema'

// Metric weights configuration - these match your Word document
  const METRIC_WEIGHTS = {
    ytd: 0.025,           // 2.5%
    oneYear: 0.05,        // 5%
    threeYear: 0.10,      // 10%
    fiveYear: 0.15,       // 15%
    tenYear: 0.10,        // 10%
    sharpe3Y: 0.10,       // 10%
    stdDev3Y: -0.075,     // -7.5% (negative weight penalizes volatility)
    stdDev5Y: -0.125,     // -12.5%
    upCapture3Y: 0.075,   // 7.5%
    downCapture3Y: -0.10, // -10% (negative weight penalizes downside capture)
    alpha5Y: 0.05,        // 5%
    expenseRatio: -0.025, // -2.5%
    managerTenure: 0.025  // 2.5%
  };
  
  // Metric display names for reporting
  const METRIC_LABELS = {
    ytd: 'YTD Return',
    oneYear: '1-Year Return',
    threeYear: '3-Year Return',
    fiveYear: '5-Year Return',
    tenYear: '10-Year Return',
    sharpe3Y: '3Y Sharpe Ratio',
    stdDev3Y: '3Y Std Deviation',
    stdDev5Y: '5Y Std Deviation',
    upCapture3Y: '3Y Up Capture',
    downCapture3Y: '3Y Down Capture',
    alpha5Y: '5Y Alpha',
    expenseRatio: 'Expense Ratio',
    managerTenure: 'Manager Tenure'
  };
  
  /**
   * Calculate Z-score for a value within a distribution
   * @param {number} value - The value to calculate Z-score for
   * @param {number} mean - Mean of the distribution
   * @param {number} stdDev - Standard deviation of the distribution
   * @returns {number} Z-score
   */
  function calculateZScore(value, mean, stdDev) {
    if (stdDev === 0 || isNaN(stdDev)) return 0;
    return (value - mean) / stdDev;
  }
  
  /**
   * Calculate mean of an array of numbers, ignoring null/undefined
   * @param {Array<number>} values - Array of values
   * @returns {number} Mean value
   */
  function calculateMean(values) {
    const validValues = values.filter(v => v != null && !isNaN(v));
    if (validValues.length === 0) return 0;
    return validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
  }
  
  /**
   * Calculate standard deviation of an array of numbers
   * @param {Array<number>} values - Array of values
   * @param {number} mean - Pre-calculated mean
   * @returns {number} Standard deviation
   */
  function calculateStdDev(values, mean) {
    const validValues = values.filter(v => v != null && !isNaN(v));
    if (validValues.length <= 1) return 0;
    
    const squaredDiffs = validValues.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / validValues.length;
    return Math.sqrt(avgSquaredDiff);
  }
  
  /**
   * Transform raw Z-score sum to 0-100 scale
   * @param {number} rawScore - Sum of weighted Z-scores
   * @param {Array<number>} allRawScores - All raw scores in the asset class
   * @returns {number} Score scaled to 0-100
   */
  function scaleScore(rawScore) {
    const scaled = 50 + 10 * rawScore;
    if (scaled < 0) return 0;
    if (scaled > 100) return 100;
    return Math.round(scaled * 10) / 10;
  }
  
  /**
   * Parse metric value from Excel data
   * Handles percentage strings and various formats
   * @param {any} value - Raw value from Excel
   * @returns {number|null} Parsed numeric value
   */
  function parseMetricValue(value) {
    if (value == null || value === '' || value === 'N/A' || value === 'N/A N/A') return null;
    
    // If already a number, return it
    if (typeof value === 'number') return value;
    
    // Convert string to number
    if (typeof value === 'string') {
      // Remove percentage sign and commas
      const cleaned = value.replace(/[%,]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? null : parsed;
    }
    
    return null;
  }
  
  /**
   * Extract metrics from fund data based on column mappings
   * @param {Object} fundData - Raw fund data from Excel
   * @returns {Object} Standardized metrics object
   */
  function extractMetrics(fundData) {
    // Map the column names from your Excel file to our metric names
    // Note: Some metrics might be in different columns or missing
    return {
      ytd: parseMetricValue(fundData.ytd),
      oneYear: parseMetricValue(fundData.oneYear),
      threeYear: parseMetricValue(fundData.threeYear),
      fiveYear: parseMetricValue(fundData.fiveYear),
      tenYear: parseMetricValue(fundData.tenYear),
      sharpe3Y: parseMetricValue(fundData.sharpe3Y),
      stdDev3Y: parseMetricValue(fundData.stdDev3Y),
      stdDev5Y: parseMetricValue(fundData.stdDev5Y),
      upCapture3Y: parseMetricValue(fundData.upCapture3Y),
      downCapture3Y: parseMetricValue(fundData.downCapture3Y),
      alpha5Y: parseMetricValue(fundData.alpha5Y),
      expenseRatio: parseMetricValue(fundData.expenseRatio),
      managerTenure: parseMetricValue(fundData.managerTenure)
    };
  }
  
  /**
   * Calculate distribution statistics for each metric within an asset class
   * @param {Array<Object>} funds - Funds in the same asset class
   * @returns {Object} Statistics for each metric
   */
  function calculateMetricStatistics(funds) {
    const stats = {};
    
    Object.keys(METRIC_WEIGHTS).forEach(metric => {
      const values = funds.map(fund => fund.metrics?.[metric]).filter(v => v != null);
      const mean = calculateMean(values);
      const stdDev = calculateStdDev(values, mean);
      
      stats[metric] = {
        mean,
        stdDev,
        count: values.length,
        min: values.length > 0 ? Math.min(...values) : 0,
        max: values.length > 0 ? Math.max(...values) : 0
      };
    });
    
    return stats;
  }
  
  /**
   * Calculate weighted Z-score for a single fund
   * @param {Object} fund - Fund with metrics
   * @param {Object} statistics - Metric statistics for the asset class
   * @returns {Object} Score details including breakdown
   */
  function calculateFundScore(fund, statistics) {
    const scoreBreakdown = {};
    let weightedSum = 0;
    
    Object.entries(METRIC_WEIGHTS).forEach(([metric, weight]) => {
      const value = fund.metrics?.[metric];
      const stats = statistics[metric];
      
      if (value != null && stats && stats.stdDev > 0) {
        const zScore = calculateZScore(value, stats.mean, stats.stdDev);
        const weightedZScore = zScore * weight;
        
        scoreBreakdown[metric] = {
          value,
          zScore: Math.round(zScore * 100) / 100, // Round to 2 decimals
          weight,
          weightedZScore: Math.round(weightedZScore * 1000) / 1000, // Round to 3 decimals
          percentile: calculatePercentile(value, stats, metric, weight)
        };
        
        weightedSum += weightedZScore;
      }
    });
    
    // Don't adjust weights - use raw sum
    // This maintains consistency when funds have missing metrics
    
    return {
      raw: weightedSum,
      breakdown: scoreBreakdown,
      metricsUsed: Object.keys(scoreBreakdown).length,
      totalPossibleMetrics: Object.keys(METRIC_WEIGHTS).length
    };
  }
  
  /**
   * Calculate percentile rank for a value within distribution
   * @param {number} value - Value to rank
   * @param {Object} stats - Distribution statistics
   * @param {string} metric - Metric name
   * @param {number} weight - Metric weight (for determining direction)
   * @returns {number} Percentile (0-100)
   */
  function calculatePercentile(value, stats, metric, weight) {
    // For negative weight metrics (like expense ratio), lower is better
    // So we need to invert the percentile
    const zScore = calculateZScore(value, stats.mean, stats.stdDev);
    
    // Using normal distribution approximation
    let percentile = (1 + erf(zScore / Math.sqrt(2))) / 2 * 100;
    
    // If negative weight, invert percentile (lower values get higher percentiles)
    if (weight < 0) {
      percentile = 100 - percentile;
    }
    
    return Math.round(percentile);
  }
  
  // Error function approximation for percentile calculation
  function erf(x) {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
  
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);
  
    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  
    return sign * y;
  }
  
  /**
   * Main scoring function - calculates scores for all funds
   * @param {Array<Object>} funds - All funds with asset class assignments
   * @returns {Array<Object>} Funds with calculated scores
   */
  export function calculateScores(funds) {
    // Group funds by asset class and ignore rows explicitly marked as Benchmark
    const fundsByClass = {};
    funds.forEach(fund => {
      const assetClass = fund.assetClass || 'Unknown';
      if (!fundsByClass[assetClass]) {
        fundsByClass[assetClass] = [];
      }
      fundsByClass[assetClass].push(fund);
    });
    
    // Calculate scores within each asset class
    const scoredFunds = [];
    
    Object.entries(fundsByClass).forEach(([assetClass, classFunds]) => {
      // Skip if only one fund in class (can't calculate meaningful statistics)
      if (classFunds.length < 2) {
        classFunds.forEach(fund => {
          scoredFunds.push({
            ...fund,
            metrics: extractMetrics(fund),
            scores: {
              raw: 0,
              final: 50, // Default to middle score
              percentile: 50,
              breakdown: {},
              metricsUsed: 0,
              totalPossibleMetrics: Object.keys(METRIC_WEIGHTS).length,
              note: 'Insufficient funds in asset class for scoring'
            }
          });
        });
        return;
      }
      
      // Extract and standardize metrics for all funds
      const fundsWithMetrics = classFunds.map(fund => ({
        ...fund,
        metrics: extractMetrics(fund)
      }));
      
      // Calculate statistics for the asset class using peer funds only
      // Benchmarks should not affect the averages or standard deviations
      const peerFunds = fundsWithMetrics.filter(f => !f.isBenchmark);
      const statistics = calculateMetricStatistics(peerFunds);
      
      // Calculate raw scores for all funds
      const fundsWithRawScores = fundsWithMetrics.map(fund => {
        const scoreData = calculateFundScore(fund, statistics);
        return {
          ...fund,
          scoreData
        };
      });
      
      // Get all raw scores for scaling
      const rawScores = fundsWithRawScores.map(f => f.scoreData.raw);

      // Scale scores to 0-100 and calculate final percentiles
      fundsWithRawScores.forEach(fund => {
        const finalScore = scaleScore(fund.scoreData.raw);
        
        // Calculate percentile within asset class
        const betterThanCount = rawScores.filter(s => s < fund.scoreData.raw).length;
        const percentile = Math.round((betterThanCount / rawScores.length) * 100);
        
        scoredFunds.push({
          ...fund,
          scores: {
            raw: Math.round(fund.scoreData.raw * 1000) / 1000, // Round to 3 decimals
            final: finalScore,
            percentile,
            breakdown: fund.scoreData.breakdown,
            metricsUsed: fund.scoreData.metricsUsed,
            totalPossibleMetrics: fund.scoreData.totalPossibleMetrics
          }
        });
      });
    });
    
    return scoredFunds;
  }
  
  /**
   * Generate score summary report for an asset class
   * @param {Array<Object>} funds - Scored funds in the asset class
   * @returns {Object} Summary statistics
   */
  export function generateClassSummary(funds) {
    const benchmarkFund = funds.find(f => f.isBenchmark);
    const peers = funds.filter(f => !f.isBenchmark);
    const scores = peers.map(f => f.scores?.final || 0);

    const sortedScores = [...scores].sort((a, b) => a - b);
    const medianIndex = Math.floor(sortedScores.length / 2);
    
    return {
      fundCount: peers.length,
      averageScore: Math.round(calculateMean(scores) * 10) / 10,
      medianScore: sortedScores[medianIndex]
        ? Math.round(sortedScores[medianIndex] * 10) / 10
        : 0,
      topPerformer: peers.reduce((best, fund) =>
        (fund.scores?.final || 0) > (best.scores?.final || 0) ? fund : best, peers[0]
      ),
      bottomPerformer: peers.reduce((worst, fund) =>
        (fund.scores?.final || 0) < (worst.scores?.final || 0) ? fund : worst, peers[0]
      ),
      benchmarkScore: benchmarkFund?.scores?.final,
      distribution: {
        excellent: scores.filter(s => s >= 70).length,       // 70-100
        good: scores.filter(s => s >= 50 && s < 70).length, // 50-70
        poor: scores.filter(s => s < 50).length             // 0-50
      }
    };
  }
  
  /**
   * Identify funds that need review based on scores and rules
   * @param {Array<Object>} funds - Scored funds
   * @returns {Array<Object>} Funds flagged for review with reasons
   */
  export function identifyReviewCandidates(funds) {
    const reviewCandidates = [];
    
    funds.forEach(fund => {
      const reasons = [];
      
      // Skip if no scores calculated
      if (!fund.scores) return;
      
      // Check various conditions
      if (fund.scores.final < 40) {
        reasons.push('Low overall score (<40)');
      }
      
      if (fund.scores.percentile < 25) {
        reasons.push('Bottom quartile in asset class');
      }
      
      const breakdown = fund.scores.breakdown || {};

      if (breakdown.sharpe3Y?.percentile < 30) {
        reasons.push('Poor risk-adjusted returns');
      }
      
      if (breakdown.expenseRatio?.percentile < 25) {
        reasons.push('High expense ratio (bottom quartile)');
      }
      
      if (breakdown.downCapture3Y?.value > 110) {
        reasons.push('High downside capture (>110%)');
      }
      
      if (fund.isRecommended && fund.scores.final < 50) {
        reasons.push('Recommended fund below average');
      }
      
      if (reasons.length > 0) {
        reviewCandidates.push({
          ...fund,
          reviewReasons: reasons
        });
      }
    });
    
    return reviewCandidates;
  }
  
  /**
   * Get score color based on value
   * @param {number} score - Score value (0-100)
   * @returns {string} Color hex code
   */
export { getScoreColor, getScoreLabel } from '@/utils/scoreTags';
  
  // Export all metric information for UI use
  export const METRICS_CONFIG = {
    weights: METRIC_WEIGHTS,
    labels: METRIC_LABELS
  };
