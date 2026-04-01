const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['mtn', 'airtel', 'bank', 'crypto_usdt'], required: true },
  phone: { type: String, required: true },
  proof: {
    publicId: String,
    url: String,
  },
  reference: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'processing'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Deposit', depositSchema);
