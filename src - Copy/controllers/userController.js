const asyncHandler = require('../utils/asyncHandler');
const { getUserDashboardData } = require('../services/dashboardService');
const { settleMaturedInvestmentsForUser } = require('../services/investmentLifecycleService');
const User = require('../models/User');
const Investment = require('../models/Investment');
const formatCurrency = require('../utils/formatCurrency');
const { getUploadedAsset } = require('../middlewares/uploadMiddleware');

exports.getDashboard = asyncHandler(async (req, res) => {
  await settleMaturedInvestmentsForUser(req.user._id);
  const freshUser = await User.findById(req.user._id).select('-password -refreshTokenHash');
  req.user = freshUser;
  res.locals.currentUser = freshUser;
  const data = await getUserDashboardData(req.user._id);
  const totals = {
    balance: formatCurrency(freshUser.balance),
    totalInvested: formatCurrency(freshUser.totalInvested),
    totalProfit: formatCurrency(freshUser.totalProfit),
    referralEarnings: formatCurrency(freshUser.referralEarnings),
    activeInvestmentsCount: data.activeInvestments.length,
  };
  res.render('pages/dashboard', { title: 'Dashboard', data, totals });
});

exports.getProfilePage = asyncHandler(async (req, res) => {
  const investments = await Investment.find({ user: req.user._id }).populate('plan').sort({ createdAt: -1 }).limit(5);
  res.render('pages/profile', { title: 'Profile', investments });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const update = {
    fullName: req.body.fullName,
    phone: req.body.phone,
  };

  const uploadedAsset = getUploadedAsset(req.file);
  if (uploadedAsset) update.profileImage = uploadedAsset;

  await User.findByIdAndUpdate(req.user._id, update, { runValidators: true });
  res.redirect('/profile?success=Profile updated successfully');
});
