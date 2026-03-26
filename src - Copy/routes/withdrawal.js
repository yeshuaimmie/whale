const express = require('express');
const withdrawalController = require('../controllers/withdrawalController');
const { requireAuth } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createWithdrawalValidation } = require('../validations/withdrawalValidation');
const router = express.Router();

router.get('/withdrawals', requireAuth, withdrawalController.getWithdrawalPage);
router.post('/withdrawals', requireAuth, createWithdrawalValidation, validate, withdrawalController.createWithdrawal);

module.exports = router;
