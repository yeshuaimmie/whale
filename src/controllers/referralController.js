const asyncHandler = require('../utils/asyncHandler');
const ReferralBonus = require('../models/ReferralBonus');
const User = require('../models/User');
const Investment = require('../models/Investment');
const getAppUrl = require('../utils/getAppUrl');

exports.getReferralPage = asyncHandler(async (req, res) => {
  const [bonuses, referrals, activeReferralUserIds] = await Promise.all([
    ReferralBonus.find({ referrer: req.user._id }).populate('referredUser', 'fullName email createdAt').sort({ createdAt: -1 }),
    User.find({ referredBy: req.user._id }).select('fullName email createdAt totalInvested'),
    Investment.distinct('user', { user: { $in: await User.find({ referredBy: req.user._id }).distinct('_id') } }),
  ]);

  const totalBonus = bonuses.reduce((sum, item) => sum + item.amount, 0);
  const activeSet = new Set(activeReferralUserIds.map((id) => String(id)));
  const activeReferrals = referrals.filter((user) => activeSet.has(String(user._id)) || user.totalInvested > 0).length;
  const appUrl = getAppUrl(req);
  const referralLink = `${appUrl}/register?ref=${encodeURIComponent(req.user.referralCode || '')}`;

  const referralRows = referrals.map((user) => {
    const userBonuses = bonuses.filter((bonus) => String(bonus.referredUser?._id || bonus.referredUser) === String(user._id));
    const totalCommission = userBonuses.reduce((sum, item) => sum + item.amount, 0);
    const investedAmount = user.totalInvested || 0;
    return {
      user,
      investedAmount,
      totalCommission,
      status: investedAmount > 0 ? 'active' : 'pending',
    };
  }).sort((a, b) => new Date(b.user.createdAt) - new Date(a.user.createdAt));

  res.render('pages/referrals', {
    title: 'Referrals',
    bonuses,
    totalBonus,
    referralLink,
    referralRows,
    stats: {
      totalReferrals: referrals.length,
      activeReferrals,
      referralEarnings: totalBonus,
      commissionRate: '5-10%',
    },
  });
});
