const asyncHandler = require('../utils/asyncHandler');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Investment = require('../models/Investment');
const ReferralBonus = require('../models/ReferralBonus');
const AuditLog = require('../models/AuditLog');
const auditService = require('../services/auditService');
const ApiError = require('../utils/ApiError');

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

exports.getDashboard = asyncHandler(async (_req, res) => {
  const today = startOfToday();
  const [
    usersCount,
    depositsCount,
    withdrawalsCount,
    investmentsCount,
    pendingDepositsCount,
    pendingWithdrawalsCount,
    totalDeposited,
    totalWithdrawn,
    totalActiveCapital,
    totalProfitPaid,
    newUsersToday,
    depositsToday,
    withdrawalsToday,
    recentUsers,
    pendingDeposits,
    pendingWithdrawals,
    recentInvestments,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Deposit.countDocuments(),
    Withdrawal.countDocuments(),
    Investment.countDocuments(),
    Deposit.countDocuments({ status: 'pending' }),
    Withdrawal.countDocuments({ status: 'pending' }),
    Deposit.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Withdrawal.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Investment.aggregate([{ $match: { status: 'active' } }, { $group: { _id: null, total: { $sum: '$principal' } } }]),
    Investment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: { $subtract: ['$expectedReturn', '$principal'] } } } }]),
    User.countDocuments({ role: 'user', createdAt: { $gte: today } }),
    Deposit.aggregate([{ $match: { status: 'approved', createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Withdrawal.aggregate([{ $match: { status: 'completed', createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    User.find({ role: 'user' }).sort({ createdAt: -1 }).limit(8),
    Deposit.find({ status: 'pending' }).populate('user', 'fullName email phone').sort({ createdAt: -1 }).limit(5),
    Withdrawal.find({ status: 'pending' }).populate('user', 'fullName email phone').sort({ createdAt: -1 }).limit(5),
    Investment.find().populate('user', 'fullName').populate('plan').sort({ createdAt: -1 }).limit(6),
  ]);

  res.render('pages/admin-dashboard', {
    title: 'Admin Dashboard',
    metrics: {
      usersCount,
      depositsCount,
      withdrawalsCount,
      investmentsCount,
      pendingDepositsCount,
      pendingWithdrawalsCount,
      totalDeposited: totalDeposited[0]?.total || 0,
      totalWithdrawn: totalWithdrawn[0]?.total || 0,
      totalActiveCapital: totalActiveCapital[0]?.total || 0,
      totalProfitPaid: totalProfitPaid[0]?.total || 0,
      newUsersToday,
      depositsToday: depositsToday[0]?.total || 0,
      withdrawalsToday: withdrawalsToday[0]?.total || 0,
    },
    recentUsers,
    pendingDeposits,
    pendingWithdrawals,
    recentInvestments,
  });
});

exports.getUsersPage = asyncHandler(async (_req, res) => {
  const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).lean();
  const userIds = users.map((user) => user._id);
  const investments = await Investment.find({ user: { $in: userIds } }).populate('plan').sort({ createdAt: -1 }).lean();

  const investmentMap = new Map();
  for (const investment of investments) {
    const key = String(investment.user);
    if (!investmentMap.has(key)) investmentMap.set(key, []);
    investmentMap.get(key).push(investment);
  }

  const enrichedUsers = users.map((user) => {
    const userInvestments = investmentMap.get(String(user._id)) || [];
    const latestInvestment = userInvestments[0] || null;
    return {
      ...user,
      investmentCount: userInvestments.length,
      activeInvestmentCount: userInvestments.filter((item) => item.status === 'active').length,
      latestInvestment,
    };
  });

  res.render('pages/admin-users', { title: 'Admin Users', users: enrichedUsers, totalUsers: enrichedUsers.length });
});

exports.toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'user' });
  if (!user) return res.redirect('/admin/users?error=User not found');
  user.isActive = !user.isActive;
  await user.save();
  await auditService.log({ actor: req.user._id, action: 'user-status-toggled', targetModel: 'User', targetId: user._id, metadata: { isActive: user.isActive } });
  res.redirect(`/admin/users?success=${encodeURIComponent(`User ${user.isActive ? 'activated' : 'disabled'} successfully`)}`);
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, role: 'user' }).lean();
  if (!user) return res.redirect('/admin/users?error=User not found');

  await Promise.all([
    Deposit.deleteMany({ user: user._id }),
    Withdrawal.deleteMany({ user: user._id }),
    Investment.deleteMany({ user: user._id }),
    ReferralBonus.deleteMany({ $or: [{ referrer: user._id }, { referredUser: user._id }] }),
    AuditLog.deleteMany({
      $or: [
        { actor: user._id },
        { targetModel: 'User', targetId: user._id },
      ],
    }),
    User.updateMany({ referredBy: user._id }, { $set: { referredBy: null } }),
    User.deleteOne({ _id: user._id, role: 'user' }),
  ]);

  await auditService.log({
    actor: req.user._id,
    action: 'user-deleted',
    targetModel: 'User',
    targetId: user._id,
    metadata: {
      deletedUserEmail: user.email,
      deletedUserName: user.fullName,
    },
  });

  res.redirect('/admin/users?success=User and related records deleted successfully');
});

exports.getDepositsPage = asyncHandler(async (_req, res) => {
  const today = startOfToday();
  const deposits = await Deposit.find().populate('user', 'fullName email phone').sort({ createdAt: -1 }).lean();

  const summary = {
    totalAmount: deposits.reduce((sum, item) => sum + item.amount, 0),
    approvedAmount: deposits.filter((item) => item.status === 'approved').reduce((sum, item) => sum + item.amount, 0),
    approvedCount: deposits.filter((item) => item.status === 'approved').length,
    pendingCount: deposits.filter((item) => item.status === 'pending').length,
    processingCount: deposits.filter((item) => item.status === 'processing').length,
    rejectedCount: deposits.filter((item) => item.status === 'rejected').length,
    todayAmount: deposits.filter((item) => new Date(item.createdAt) >= today).reduce((sum, item) => sum + item.amount, 0),
  };

  res.render('pages/admin-deposits', { title: 'Admin Deposits', deposits, summary });
});

exports.getWithdrawalsPage = asyncHandler(async (_req, res) => {
  const today = startOfToday();
  const withdrawals = await Withdrawal.find().populate('user', 'fullName email phone').sort({ createdAt: -1 }).lean();

  const summary = {
    totalAmount: withdrawals.filter((item) => item.status === 'completed').reduce((sum, item) => sum + item.amount, 0),
    completedCount: withdrawals.filter((item) => item.status === 'completed').length,
    pendingCount: withdrawals.filter((item) => item.status === 'pending').length,
    processingCount: withdrawals.filter((item) => item.status === 'processing').length,
    failedCount: withdrawals.filter((item) => item.status === 'failed').length,
    todayAmount: withdrawals.filter((item) => item.status === 'completed' && item.processedAt && new Date(item.processedAt) >= today).reduce((sum, item) => sum + item.amount, 0),
    averageCompletedAmount: withdrawals.filter((item) => item.status === 'completed').length
      ? Math.round(withdrawals.filter((item) => item.status === 'completed').reduce((sum, item) => sum + item.amount, 0) / withdrawals.filter((item) => item.status === 'completed').length)
      : 0,
  };

  res.render('pages/admin-withdrawals', { title: 'Admin Withdrawals', withdrawals, summary });
});

exports.getInvestmentsPage = asyncHandler(async (_req, res) => {
  const investments = await Investment.find().populate('user', 'fullName email').populate('plan').sort({ createdAt: -1 });
  res.render('pages/admin-investments', { title: 'Admin Investments', investments });
});

exports.getSettingsPage = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user._id).select('-password -refreshTokenHash');
  res.render('pages/admin-settings', { title: 'Admin Settings', admin });
});

exports.updateSettingsPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  if (!currentPassword || !newPassword || !confirmPassword) return res.redirect('/admin/settings?error=All password fields are required');
  if (newPassword !== confirmPassword) return res.redirect('/admin/settings?error=New passwords do not match');
  if (newPassword.length < 8) return res.redirect('/admin/settings?error=New password must be at least 8 characters');

  const admin = await User.findById(req.user._id);
  if (!admin) throw new ApiError(404, 'Admin account not found');
  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) return res.redirect('/admin/settings?error=Current password is incorrect');

  admin.password = await bcrypt.hash(newPassword, 12);
  admin.refreshTokenHash = null;
  await admin.save();

  await auditService.log({
    actor: req.user._id,
    action: 'admin-password-updated',
    targetModel: 'User',
    targetId: admin._id,
  });

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.redirect('/login?success=Password changed successfully. Please sign in again.');
});

exports.updateDepositStatus = asyncHandler(async (req, res) => {
  const allowedStatuses = ['pending', 'approved', 'rejected', 'processing'];
  const nextStatus = req.body.status;
  if (!allowedStatuses.includes(nextStatus)) return res.redirect('/admin/deposits?error=Invalid deposit status');

  const deposit = await Deposit.findById(req.params.id);
  if (!deposit) return res.redirect('/admin/deposits?error=Deposit not found');

  const previousStatus = deposit.status;
  if (previousStatus === nextStatus) return res.redirect('/admin/deposits?success=No changes made');

  deposit.status = nextStatus;
  deposit.reviewedBy = req.user._id;
  deposit.reviewedAt = new Date();
  await deposit.save();

  if (previousStatus !== 'approved' && nextStatus === 'approved') {
    await User.findByIdAndUpdate(deposit.user, { $inc: { balance: deposit.amount } });
  }
  if (previousStatus === 'approved' && nextStatus !== 'approved') {
    await User.findByIdAndUpdate(deposit.user, { $inc: { balance: -deposit.amount } });
  }

  await auditService.log({ actor: req.user._id, action: 'deposit-status-updated', targetModel: 'Deposit', targetId: deposit._id, metadata: { previousStatus, nextStatus } });
  res.redirect('/admin/deposits?success=Deposit updated successfully');
});

exports.updateWithdrawalStatus = asyncHandler(async (req, res) => {
  const allowedStatuses = ['pending', 'processing', 'completed', 'failed'];
  const nextStatus = req.body.status;
  if (!allowedStatuses.includes(nextStatus)) return res.redirect('/admin/withdrawals?error=Invalid withdrawal status');

  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) return res.redirect('/admin/withdrawals?error=Withdrawal not found');
  const previousStatus = withdrawal.status;
  if (previousStatus === nextStatus) return res.redirect('/admin/withdrawals?success=No changes made');

  withdrawal.status = nextStatus;
  withdrawal.processedBy = req.user._id;
  withdrawal.processedAt = new Date();
  await withdrawal.save();

  const debitedFromProfit = Number(withdrawal.debitedFromProfit ?? withdrawal.amount ?? 0);
  const debitedFromReferral = Number(withdrawal.debitedFromReferral || 0);

  if (previousStatus !== 'failed' && nextStatus === 'failed') {
    await User.findByIdAndUpdate(withdrawal.user, {
      $inc: {
        totalProfit: debitedFromProfit,
        referralEarnings: debitedFromReferral,
      },
    });
  }
  if (previousStatus === 'failed' && nextStatus !== 'failed') {
    await User.findByIdAndUpdate(withdrawal.user, {
      $inc: {
        totalProfit: -debitedFromProfit,
        referralEarnings: -debitedFromReferral,
      },
    });
  }

  await auditService.log({ actor: req.user._id, action: 'withdrawal-status-updated', targetModel: 'Withdrawal', targetId: withdrawal._id, metadata: { previousStatus, nextStatus } });
  res.redirect('/admin/withdrawals?success=Withdrawal updated successfully');
});
