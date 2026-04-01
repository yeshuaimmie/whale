const asyncHandler = require('../utils/asyncHandler');
const InvestmentPlan = require('../models/InvestmentPlan');
const Investment = require('../models/Investment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { createReferralBonus } = require('../services/referralService');
const { settleMaturedInvestmentsForUser } = require('../services/investmentLifecycleService');

exports.getInvestPage = asyncHandler(async (req, res) => {
  await settleMaturedInvestmentsForUser(req.user._id);
  const plans = await InvestmentPlan.find({ isActive: true }).sort({ minimumAmount: 1 });
  const investments = await Investment.find({ user: req.user._id }).populate('plan').sort({ createdAt: -1 });
  const freshUser = await User.findById(req.user._id).select('-password -refreshTokenHash');
  req.user = freshUser;
  res.locals.currentUser = freshUser;
  res.render('pages/invest', { title: 'Invest', plans, investments });
});

exports.createInvestment = asyncHandler(async (req, res) => {
  const amount = Number(req.body.amount);
  const plan = await InvestmentPlan.findById(req.body.planId);
  if (!plan || !plan.isActive) throw new ApiError(404, 'Plan not found');
  if (amount < plan.minimumAmount) throw new ApiError(400, 'Amount is below the plan minimum');
  if (plan.maximumAmount && amount > plan.maximumAmount) throw new ApiError(400, 'Amount exceeds the plan maximum');
  if (amount > req.user.balance) throw new ApiError(400, 'Insufficient balance');

  const expectedReturn = amount + (amount * (plan.dailyRate / 100) * plan.durationDays);
  const endDate = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);

  const investment = await Investment.create({
    user: req.user._id,
    plan: plan._id,
    principal: amount,
    dailyRate: plan.dailyRate,
    durationDays: plan.durationDays,
    expectedReturn,
    endDate,
  });

  await User.findByIdAndUpdate(req.user._id, { $inc: { balance: -amount, totalInvested: amount } });

  if (req.user.referredBy) {
    await createReferralBonus({
      referrerId: req.user.referredBy,
      referredUserId: req.user._id,
      investmentId: investment._id,
      amount: (amount * Math.max(Number(plan.referralBonusRate) || 10, 10)) / 100,
    });
  }

  res.redirect('/invest?success=Investment created successfully');
});
