const { body } = require('express-validator');

exports.createWithdrawalValidation = [
  body('amount').isFloat({ min: 10000 }).withMessage('Minimum withdrawal is UGX 10,000'),
  body('paymentMethod').isIn(['mtn', 'airtel', 'bank']).withMessage('Invalid payment method'),
  body('phone').trim().isLength({ min: 10 }).withMessage('Phone number is required'),
  body('accountName').trim().isLength({ min: 2 }).withMessage('Account name is required'),
];
