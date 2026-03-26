const asyncHandler = require('../utils/asyncHandler');
const InvestmentPlan = require('../models/InvestmentPlan');

exports.getHomePage = asyncHandler(async (req, res) => {
  const plans = await InvestmentPlan.find({ isActive: true }).sort({ minimumAmount: 1 });
  res.render('pages/home', { title: 'Home', plans });
});

exports.getAboutPage = asyncHandler(async (req, res) => {
  const plans = await InvestmentPlan.find({ isActive: true }).sort({ minimumAmount: 1 });
  res.render('pages/about', { title: 'About', plans });
});
