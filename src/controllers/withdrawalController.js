const asyncHandler = require('../utils/asyncHandler');
const Withdrawal = require('../models/Withdrawal');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { settleMaturedInvestmentsForUser } = require('../services/investmentLifecycleService');

exports.getWithdrawalPage = asyncHandler(async (req, res) => {
  await settleMaturedInvestmentsForUser(req.user._id);
  const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
  const freshUser = await User.findById(req.user._id).select('-password -refreshTokenHash');
  const availableProfit =
    Number(freshUser.totalProfit || 0) +
    Number(freshUser.accruedProfit || 0) +
    Number(freshUser.referralEarnings || 0);
  req.user = freshUser;
  res.locals.currentUser = freshUser;
  res.render('pages/withdrawals', {
    title: 'Withdrawals',
    withdrawals,
    availableProfit,
  });
});

exports.createWithdrawal = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const freshUser = await User.findById(req.user._id).select('totalProfit accruedProfit referralEarnings phone');

  // Validate that the withdrawal phone matches the registered phone
  const submittedPhone = (req.body.phone || '').trim();
  const registeredPhone = (freshUser?.phone || '').trim();
  if (submittedPhone !== registeredPhone) {
    throw new ApiError(400, 'The mobile money number does not match your registered number. Withdrawals can only be made to the number registered on your account.');
  }

  const totalProfit = Number(freshUser?.totalProfit || 0);
  const accruedProfit = Number(freshUser?.accruedProfit || 0);
  const referralEarnings = Number(freshUser?.referralEarnings || 0);
  const availableProfit = totalProfit + accruedProfit + referralEarnings;
  if (amount > availableProfit) throw new ApiError(400, 'Insufficient profit balance');

  const debitedFromReferral = Math.min(amount, referralEarnings);
  const debitedFromProfit = amount - debitedFromReferral;

  const reference = `WDR-${Date.now()}`;
  await Withdrawal.create({
    user: req.user._id,
    amount,
    debitedFromProfit,
    debitedFromReferral,
    paymentMethod: req.body.paymentMethod,
    phone: req.body.phone,
    accountName: req.body.accountName,
    reference,
  });
  await User.findByIdAndUpdate(req.user._id, {
    $inc: {
      totalProfit: -debitedFromProfit,
      referralEarnings: -debitedFromReferral,
    },
  });
  res.redirect('/withdrawals?success=Withdrawal request submitted');
});
