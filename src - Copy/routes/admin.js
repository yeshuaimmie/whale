const express = require('express');
const rateLimit = require('express-rate-limit');
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');
const router = express.Router();

const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false });

router.use('/admin', requireAuth, requireRole('admin'), adminLimiter);
router.get('/admin', adminController.getDashboard);
router.get('/admin/users', adminController.getUsersPage);
router.post('/admin/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/admin/deposits', adminController.getDepositsPage);
router.post('/admin/deposits/:id', adminController.updateDepositStatus);
router.get('/admin/withdrawals', adminController.getWithdrawalsPage);
router.post('/admin/withdrawals/:id', adminController.updateWithdrawalStatus);
router.get('/admin/investments', adminController.getInvestmentsPage);
router.get('/admin/settings', adminController.getSettingsPage);
router.post('/admin/settings/password', adminController.updateSettingsPassword);

module.exports = router;
