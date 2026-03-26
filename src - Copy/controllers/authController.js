const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const User = require('../models/User');
const { verifyRefreshToken, hashToken, signAccessToken, signRefreshToken, accessCookieOptions, refreshCookieOptions } = require('../utils/jwt');

exports.getLoginPage = asyncHandler(async (_req, res) => {
  res.render('pages/login', { title: 'Login' });
});

exports.getRegisterPage = asyncHandler(async (req, res) => {
  res.render('pages/register', { title: 'Register', referralCodePrefill: req.query.ref || req.query.referralCode || '' });
});

exports.register = asyncHandler(async (req, res) => {
  await authService.registerUser(req.body);
  res.redirect('/login?success=Account created successfully. Please log in.');
});

exports.login = asyncHandler(async (req, res) => {
  const data = await authService.loginUser(req.body);
  res.cookie('accessToken', data.accessToken, data.cookieOptions);
  res.cookie('refreshToken', data.refreshToken, data.refreshCookieOptions);
  res.redirect(data.user.role === 'admin' ? '/admin' : '/dashboard');
});

exports.logout = asyncHandler(async (req, res) => {
  if (req.user?._id) await authService.logoutUser(req.user._id);
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.redirect('/login?success=Logged out successfully');
});

exports.refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.redirect('/login');
  const payload = verifyRefreshToken(token);
  const user = await User.findById(payload.sub);
  if (!user || user.refreshTokenHash !== hashToken(token)) return res.redirect('/login');

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  res.cookie('accessToken', accessToken, accessCookieOptions());
  res.cookie('refreshToken', refreshToken, refreshCookieOptions());
  res.redirect(user.role === 'admin' ? '/admin' : '/dashboard');
});
