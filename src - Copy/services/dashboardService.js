const Deposit = require('../models/Deposit');
const Withdrawal = require('../models/Withdrawal');
const Investment = require('../models/Investment');
const ReferralBonus = require('../models/ReferralBonus');
const InvestmentPlan = require('../models/InvestmentPlan');

exports.getUserDashboardData = async (userId) => {
  const [recentDeposits, recentWithdrawals, activeInvestments, allInvestments, referralBonuses, plans] = await Promise.all([
    Deposit.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
    Withdrawal.find({ user: userId }).sort({ createdAt: -1 }).limit(5),
    Investment.find({ user: userId, status: 'active' }).populate('plan').sort({ createdAt: -1 }).limit(10),
    Investment.find({ user: userId }).populate('plan').sort({ createdAt: -1 }).limit(10),
    ReferralBonus.find({ referrer: userId }).sort({ createdAt: -1 }).limit(10).populate('referredUser', 'fullName email'),
    InvestmentPlan.find({ isActive: true }).sort({ minimumAmount: 1 }),
  ]);

  const pendingDeposits = recentDeposits.filter((item) => item.status === 'pending').length;
  const pendingWithdrawals = recentWithdrawals.filter((item) => item.status === 'pending').length;
  const completedInvestments = allInvestments.filter((item) => item.status === 'completed').length;

  const activityFeed = [
    ...recentDeposits.map((item) => ({
      type: 'deposit',
      title: `Deposit ${item.reference}`,
      amount: item.amount,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...recentWithdrawals.map((item) => ({
      type: 'withdrawal',
      title: `Withdrawal ${item.reference}`,
      amount: item.amount,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...allInvestments.slice(0, 5).map((item) => ({
      type: 'investment',
      title: item.plan ? `${item.plan.name} investment` : 'Investment',
      amount: item.principal,
      status: item.status,
      createdAt: item.createdAt,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  return {
    recentDeposits,
    recentWithdrawals,
    activeInvestments,
    allInvestments,
    referralBonuses,
    plans,
    stats: {
      pendingDeposits,
      pendingWithdrawals,
      completedInvestments,
      availablePlans: plans.length,
    },
    activityFeed,
  };
};
