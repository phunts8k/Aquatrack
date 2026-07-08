
const calculateWaterScore = (averageDailyLiters, benchmarkLiters = 135) => {
  if (!averageDailyLiters || averageDailyLiters <= 0) return 100;
  if (averageDailyLiters <= benchmarkLiters) return 100;

  const overageRatio = (averageDailyLiters - benchmarkLiters) / benchmarkLiters;
  const score = Math.round(100 * (1 - Math.min(overageRatio, 1)));
  return Math.max(0, score);
};

module.exports = calculateWaterScore;
