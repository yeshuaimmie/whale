const { validationResult } = require('express-validator');

module.exports = function validateMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const message = errors.array().map((item) => item.msg).join(', ');
  return res.status(422).render('pages/error', { title: 'Validation error', message });
};
