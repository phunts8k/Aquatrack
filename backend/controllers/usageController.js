const asyncHandler = require('../utils/asyncHandler');
const WaterUsage = require('../models/WaterUsage');

// @desc    Create a new water usage log entry
// @route   POST /api/usage
// @access  Private
const createUsage = asyncHandler(async (req, res) => {
  const { liters, date, location, note } = req.body;

  const usage = await WaterUsage.create({
    userId: req.user._id,
    liters,
    date: date || Date.now(),
    location,
    note,
  });

  res.status(201).json({ success: true, message: 'Usage logged', data: { usage } });
});

// @desc    Get the logged-in user's usage logs (search, sort, filter, paginate)
// @route   GET /api/usage
// @access  Private
const getUsageLogs = asyncHandler(async (req, res) => {
  const { search, from, to, sort, page = 1, limit = 10 } = req.query;

  const query = { userId: req.user._id };

  if (from || to) {
    query.date = {};
    if (from) query.date.$gte = new Date(from);
    if (to) query.date.$lte = new Date(to);
  }

  if (search) {
    query.$or = [
      { location: { $regex: search, $options: 'i' } },
      { note: { $regex: search, $options: 'i' } },
    ];
  }

  // Allowed sort fields, defaulting to newest first
  const sortMap = {
    date_asc: { date: 1 },
    date_desc: { date: -1 },
    liters_asc: { liters: 1 },
    liters_desc: { liters: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.date_desc;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const skip = (pageNum - 1) * limitNum;

  const [logs, total] = await Promise.all([
    WaterUsage.find(query).sort(sortBy).skip(skip).limit(limitNum),
    WaterUsage.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      logs,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    },
  });
});

// @desc    Update a usage log entry
// @route   PUT /api/usage/:id
// @access  Private
const updateUsage = asyncHandler(async (req, res) => {
  const usage = await WaterUsage.findOne({ _id: req.params.id, userId: req.user._id });

  if (!usage) {
    res.status(404);
    throw new Error('Usage log not found');
  }

  const { liters, date, location, note } = req.body;
  if (liters !== undefined) usage.liters = liters;
  if (date !== undefined) usage.date = date;
  if (location !== undefined) usage.location = location;
  if (note !== undefined) usage.note = note;

  const updated = await usage.save();

  res.status(200).json({ success: true, message: 'Usage updated', data: { usage: updated } });
});

// @desc    Delete a usage log entry
// @route   DELETE /api/usage/:id
// @access  Private
const deleteUsage = asyncHandler(async (req, res) => {
  const usage = await WaterUsage.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

  if (!usage) {
    res.status(404);
    throw new Error('Usage log not found');
  }

  res.status(200).json({ success: true, message: 'Usage deleted' });
});

module.exports = { createUsage, getUsageLogs, updateUsage, deleteUsage };
