/**
 * Calculates a 0-100 "water saving score" by comparing a user's average
 * daily usage against their configured daily benchmark.
 *
 * Usage at or below the benchmark scores 100. Usage above the benchmark
 * scores progressively lower, reaching 0 once usage is double the benchmark
 * or more. This keeps the score simple and explainable rather than a
 * black-box metric.
 *
 * @param {number} averageDailyLiters
 * @param {number} benchmarkLiters
 * @returns {number} score between 0 and 100
 */
const calculateWaterScore = (averageDailyLiters, benchmarkLiters = 135) => {
  if (!averageDailyLiters || averageDailyLiters <= 0) return 100;
  if (averageDailyLiters <= benchmarkLiters) return 100;

  const overageRatio = (averageDailyLiters - benchmarkLiters) / benchmarkLiters;
  const score = Math.round(100 * (1 - Math.min(overageRatio, 1)));
  return Math.max(0, score);
};

module.exports = calculateWaterScore;
