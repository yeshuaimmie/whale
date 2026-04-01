const mongoose = require('mongoose');

const investmentPlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  minimumAmount: { type: Number, required: true },
  maximumAmount: { type: Number, default: null },
  dailyRate: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  referralBonusRate: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('InvestmentPlan', investmentPlanSchema);
