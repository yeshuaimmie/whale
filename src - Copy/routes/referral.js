const express = require('express');
const referralController = require('../controllers/referralController');
const { requireAuth } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/referrals', requireAuth, referralController.getReferralPage);

module.exports = router;
