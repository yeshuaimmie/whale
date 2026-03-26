const asyncHandler = require('../utils/asyncHandler');
const Deposit = require('../models/Deposit');
const { getUploadedAsset } = require('../middlewares/uploadMiddleware');

exports.getDepositPage = asyncHandler(async (req, res) => {
  const deposits = await Deposit.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.render('pages/deposit', { title: 'Deposit', deposits });
});

exports.createDeposit = asyncHandler(async (req, res) => {
  const reference = `DEP-${Date.now()}`;
  const proof = getUploadedAsset(req.file);

  await Deposit.create({
    user: req.user._id,
    amount: Number(req.body.amount),
    paymentMethod: req.body.paymentMethod,
    phone: req.body.phone,
    proof,
    reference,
  });

  res.redirect('/deposit?success=Deposit submitted and pending admin review');
});
