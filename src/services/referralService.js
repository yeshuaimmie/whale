const ReferralBonus = require('../models/ReferralBonus');
const User = require('../models/User');

exports.createReferralBonus = async ({ referrerId, referredUserId, investmentId, amount }) => {
  if (!referrerId || amount <= 0) return null;

  const alreadyRewarded = await ReferralBonus.exists({ referrer: referrerId, referredUser: referredUserId });
  if (alreadyRewarded) return null;

  const bonus = await ReferralBonus.create({ referrer: referrerId, referredUser: referredUserId, investment: investmentId, amount });
  await User.findByIdAndUpdate(referrerId, { $inc: { balance: amount, referralEarnings: amount } });
  return bonus;
};
