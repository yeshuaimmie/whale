const express = require('express');
const investmentController = require('../controllers/investmentController');
const { requireAuth } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { createInvestmentValidation } = require('../validations/investmentValidation');
const router = express.Router();

router.get('/invest', requireAuth, investmentController.getInvestPage);
router.post('/invest', requireAuth, createInvestmentValidation, validate, investmentController.createInvestment);

module.exports = router;
