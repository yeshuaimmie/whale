const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('../controllers/authController');
const { requireGuest, requireAuth } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validateMiddleware');
const { registerValidation, loginValidation } = require('../validations/authValidation');
const router = express.Router();

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });

router.get('/login', requireGuest, authController.getLoginPage);
router.get('/register', requireGuest, authController.getRegisterPage);
router.post('/auth/register', authLimiter, registerValidation, validate, authController.register);
router.post('/auth/login', authLimiter, loginValidation, validate, authController.login);
router.get('/logout', requireAuth, authController.logout);
router.post('/auth/logout', requireAuth, authController.logout);
router.post('/auth/refresh-token', authController.refreshToken);

module.exports = router;
