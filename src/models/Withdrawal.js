const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  debitedFromProfit: { type: Number, default: 0 },
  debitedFromReferral: { type: Number, default: 0 },
  paymentMethod: { type: String, enum: ['mtn', 'airtel', 'bank'], required: true },
  phone: { type: String, required: true },
  accountName: { type: String, required: true },
  reference: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
