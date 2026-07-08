const asyncHandler = require('../utils/asyncHandler');
const WaterUsage = require('../models/WaterUsage');
const calculateWaterScore = require('../utils/waterScore');

const startOfDay = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};


const getDashboardSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  const todayStart = startOfDay(now);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6); // last 7 days inclusive of today
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 29); // last 30 days inclusive of today

  const [todayAgg, weekAgg, monthAgg, allTimeAgg, recentLogs, dailyTrend] = await Promise.all([
    WaterUsage.aggregate([
      { $match: { userId, date: { $gte: todayStart } } },
      { $group: { _id: null, total: { $sum: '$liters' } } },
    ]),
    WaterUsage.aggregate([
      { $match: { userId, date: { $gte: weekStart } } },
      { $group: { _id: null, total: { $sum: '$liters' } } },
    ]),
    WaterUsage.aggregate([
      { $match: { userId, date: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: '$liters' }, avgPerEntry: { $avg: '$liters' } } },
    ]),
    WaterUsage.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          highest: { $max: '$liters' },
          lowest: { $min: '$liters' },
        },
      },
    ]),
    WaterUsage.find({ userId }).sort({ date: -1 }).limit(5),
    WaterUsage.aggregate([
      { $match: { userId, date: { $gte: monthStart } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$liters' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const todayTotal = todayAgg[0]?.total || 0;
  const weekTotal = weekAgg[0]?.total || 0;
  const monthTotal = monthAgg[0]?.total || 0;
  const highest = allTimeAgg[0]?.highest || 0;
  const lowest = allTimeAgg[0]?.lowest || 0;

  // Average daily usage over the last 30 days, used for the saving score
  const daysWithData = dailyTrend.length || 1;
  const averageDaily = monthTotal / 30;

  const score = calculateWaterScore(averageDaily, req.user.dailyGoalLiters);

  res.status(200).json({
    success: true,
    data: {
      today: Math.round(todayTotal * 100) / 100,
      week: Math.round(weekTotal * 100) / 100,
      month: Math.round(monthTotal * 100) / 100,
      averageDaily: Math.round(averageDaily * 100) / 100,
      highest,
      lowest,
      savingScore: score,
      dailyGoalLiters: req.user.dailyGoalLiters,
      trend: dailyTrend.map((d) => ({ date: d._id, total: Math.round(d.total * 100) / 100 })),
      recentActivity: recentLogs,
    },
  });
});

module.exports = { getDashboardSummary };
