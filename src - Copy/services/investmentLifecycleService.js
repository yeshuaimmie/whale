const Investment = require('../models/Investment');
const User = require('../models/User');

exports.settleMaturedInvestmentsForUser = async (userId) => {
  const matured = await Investment.find({
    user: userId,
    status: 'active',
    endDate: { $lte: new Date() },
  });

  if (!matured.length) return { settledCount: 0, settledAmount: 0 };

  let settledAmount = 0;
  let totalProfit = 0;

  for (const item of matured) {
    item.status = 'completed';
    await item.save();
    settledAmount += item.expectedReturn;
    totalProfit += item.expectedReturn - item.principal;
  }

  await User.findByIdAndUpdate(userId, {
    $inc: {
      balance: settledAmount,
      totalProfit,
    },
  });

  return { settledCount: matured.length, settledAmount };
};
