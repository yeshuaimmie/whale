require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const InvestmentPlan = require('../models/InvestmentPlan');
const generateReferralCode = require('../utils/generateReferralCode');

(async () => {
  await connectDB();

  const plans = [
    { name: 'Armatature Plan', minimumAmount: 30000, maximumAmount: 90000, dailyRate: 2, durationDays: 60, referralBonusRate: 10 },
    { name: 'Premium Plan', minimumAmount: 100000, maximumAmount: 5000000, dailyRate: 2.5, durationDays: 60, referralBonusRate: 10 },
    { name: 'Expert Plan', minimumAmount: 5000000, maximumAmount: null, dailyRate: 2.8, durationDays: 60, referralBonusRate: 10 },
  ];

  for (const plan of plans) {
    await InvestmentPlan.findOneAndUpdate({ name: plan.name }, plan, { upsert: true, new: true });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (!existingAdmin) {
    await User.create({
      fullName: 'Admin User',
      email: adminEmail.toLowerCase(),
      phone: '0700000000',
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12),
      role: 'admin',
      referralCode: generateReferralCode('ADMIN'),
      balance: 0,
    });
  }

  console.log('Seed completed');
  process.exit(0);
})();
