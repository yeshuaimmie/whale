const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const accessCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  maxAge: 15 * 60 * 1000,
});

const refreshCookieOptions = () => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.COOKIE_SECURE === 'true',
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const signAccessToken = (user) => jwt.sign(
  { sub: user._id.toString(), role: user.role, email: user.email },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
);

const signRefreshToken = (user) => jwt.sign(
  { sub: user._id.toString(), tokenVersion: user.tokenVersion || 0 },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
);

const verifyAccessToken = (token) => jwt.verify(token, process.env.JWT_ACCESS_SECRET);
const verifyRefreshToken = (token) => jwt.verify(token, process.env.JWT_REFRESH_SECRET);
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken,
  accessCookieOptions,
  refreshCookieOptions,
};
