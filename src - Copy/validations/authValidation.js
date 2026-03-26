const { body } = require('express-validator');

exports.registerValidation = [
  body('fullName').trim().isLength({ min: 3 }).withMessage('Full name must be at least 3 characters'),
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('phone').trim().isLength({ min: 10 }).withMessage('Enter a valid phone number'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
];

exports.loginValidation = [
  body('email').isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];
