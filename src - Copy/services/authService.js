const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const generateReferralCode = require('../utils/generateReferralCode');
const { signAccessToken, signRefreshToken, hashToken, accessCookieOptions, refreshCookieOptions } = require('../utils/jwt');

exports.registerUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });
  if (existing) throw new ApiError(409, 'Email is already registered');

  let referredBy = null;
  if (payload.referralCode) {
    const referrer = await User.findOne({ referralCode: payload.referralCode.trim().toUpperCase() });
    if (referrer) referredBy = referrer._id;
  }

  const password = await bcrypt.hash(payload.password, 12);
  const user = await User.create({
    fullName: payload.fullName,
    email: payload.email.toLowerCase(),
    phone: payload.phone,
    password,
    referralCode: generateReferralCode(payload.fullName),
    referredBy,
  });

  return user;
};

exports.loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(403, 'Your account has been disabled');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  user.lastLoginAt = new Date();
  await user.save();

  return { user, accessToken, refreshToken, cookieOptions: accessCookieOptions(), refreshCookieOptions: refreshCookieOptions() };
};

exports.logoutUser = async (userId) => {
  if (!userId) return;
  await User.findByIdAndUpdate(userId, { $set: { refreshTokenHash: null }, $inc: { tokenVersion: 1 } });
};
