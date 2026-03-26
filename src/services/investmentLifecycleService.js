const Investment = require('../models/Investment');
const User = require('../models/User');

const calculateAccruedProfit = (investment, referenceDate = Date.now()) => {
  const start = new Date(investment.startDate || investment.createdAt || Date.now()).getTime();
  const msPerDay = 1000 * 60 * 60 * 24;
  const elapsedDays = Math.min(
    investment.durationDays || 0,
    Math.max(0, Math.floor((referenceDate - start) / msPerDay))
  );

  return investment.principal * (investment.dailyRate / 100) * elapsedDays;
};

exports.settleMaturedInvestmentsForUser = async (userId) => {
  const now = new Date();
  const matured = await Investment.find({
    user: userId,
    status: 'active',
    endDate: { $lte: now },
  });

  let settledAmount = 0;
  let totalProfit = 0;

  for (const item of matured) {
    item.status = 'completed';
    await item.save();
    settledAmount += item.expectedReturn;
    totalProfit += item.expectedReturn - item.principal;
  }

  const activeInvestments = await Investment.find({
    user: userId,
    status: 'active',
  }).select('principal dailyRate durationDays startDate createdAt');

  const accruedProfit = activeInvestments.reduce((sum, item) => {
    return sum + calculateAccruedProfit(item, now.getTime());
  }, 0);

  if (matured.length) {
    await User.findByIdAndUpdate(userId, {
      $inc: {
        balance: settledAmount,
        totalProfit,
      },
      $set: {
        accruedProfit,
      },
    });

    return { settledCount: matured.length, settledAmount, accruedProfit };
  }

  await User.findByIdAndUpdate(userId, {
    $set: {
      accruedProfit,
    },
  });

  return { settledCount: 0, settledAmount: 0, accruedProfit };
};
