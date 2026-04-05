const { body } = require('express-validator');

exports.createInvestmentValidation = [
  body('planId').isMongoId().withMessage('Invalid investment plan'),
  body('amount').isFloat({ min: 30000 }).withMessage('Minimum investment is UGX 30,000'),
];
