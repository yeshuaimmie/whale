const { body } = require('express-validator');

exports.createDepositValidation = [
  body('amount').isFloat({ min: 10000 }).withMessage('Minimum deposit is UGX 10,000'),
  body('paymentMethod').isIn(['mtn', 'airtel', 'bank', 'crypto_usdt']).withMessage('Invalid payment method'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number is required'),
  body('proof').custom((_value, { req }) => Boolean(req.file)).withMessage('Upload payment proof image'),
];
