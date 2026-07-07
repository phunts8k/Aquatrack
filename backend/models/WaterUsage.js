const mongoose = require('mongoose');

const waterUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    liters: {
      type: Number,
      required: [true, 'Liters value is required'],
      min: [0, 'Liters cannot be negative'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 60,
      default: '',
    },
    note: {
      type: String,
      trim: true,
      maxlength: 200,
      default: '',
    },
  },
  { timestamps: true }
);

// Speeds up range queries (weekly/monthly aggregates) scoped to a single user
waterUsageSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('WaterUsage', waterUsageSchema);
