const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  balance: { type: Number, default: 0 },
  totalInvested: { type: Number, default: 0 },
  totalProfit: { type: Number, default: 0 },
  referralEarnings: { type: Number, default: 0 },
  referralCode: { type: String, unique: true, index: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isActive: { type: Boolean, default: true },
  tokenVersion: { type: Number, default: 0 },
  refreshTokenHash: { type: String, default: null },
  profileImage: {
    publicId: String,
    url: String,
  },
  lastLoginAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
