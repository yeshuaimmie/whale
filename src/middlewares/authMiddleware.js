const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');
const getAppUrl = require('../utils/getAppUrl');

exports.attachUserToRequest = async (req, _res, next) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return next();
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('-password -refreshTokenHash');
    if (user && user.isActive) req.user = user;
    return next();
  } catch (_error) {
    return next();
  }
};

exports.requireAuth = (req, res, next) => {
  if (!req.user) return res.redirect('/login');
  return next();
};

exports.requireGuest = (req, res, next) => {
  if (req.user) return res.redirect(req.user.role === 'admin' ? '/admin' : '/dashboard');
  return next();
};

exports.attachLocals = (req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.currentPath = req.path;
  res.locals.query = req.query || {};
  res.locals.appUrl = getAppUrl(req);
  next();
};
