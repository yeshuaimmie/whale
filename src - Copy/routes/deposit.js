const express = require('express');
const depositController = require('../controllers/depositController');
const { requireAuth } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { uploadDepositProof } = require('../middlewares/uploadMiddleware');
const { createDepositValidation } = require('../validations/depositValidation');
const router = express.Router();

router.get('/deposit', requireAuth, depositController.getDepositPage);
router.post('/deposit', requireAuth, uploadDepositProof.single('proof'), createDepositValidation, validate, depositController.createDeposit);

module.exports = router;
