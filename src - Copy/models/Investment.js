const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentPlan', required: true },
  principal: { type: Number, required: true },
  dailyRate: { type: Number, required: true },
  durationDays: { type: Number, required: true },
  expectedReturn: { type: Number, required: true },
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);
