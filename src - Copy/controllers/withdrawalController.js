const asyncHandler = require('../utils/asyncHandler');
const Withdrawal = require('../models/Withdrawal');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const { settleMaturedInvestmentsForUser } = require('../services/investmentLifecycleService');

exports.getWithdrawalPage = asyncHandler(async (req, res) => {
  await settleMaturedInvestmentsForUser(req.user._id);
  const withdrawals = await Withdrawal.find({ user: req.user._id }).sort({ createdAt: -1 });
  const freshUser = await User.findById(req.user._id).select('-password -refreshTokenHash');
  req.user = freshUser;
  res.locals.currentUser = freshUser;
  res.render('pages/withdrawals', { title: 'Withdrawals', withdrawals });
});

exports.createWithdrawal = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  if (amount > req.user.balance) throw new ApiError(400, 'Insufficient balance');
  const reference = `WDR-${Date.now()}`;
  await Withdrawal.create({
    user: req.user._id,
    amount,
    paymentMethod: req.body.paymentMethod,
    phone: req.body.phone,
    accountName: req.body.accountName,
    reference,
  });
  await User.findByIdAndUpdate(req.user._id, { $inc: { balance: -amount } });
  res.redirect('/withdrawals?success=Withdrawal request submitted');
});
