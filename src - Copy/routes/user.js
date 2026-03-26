const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middlewares/authMiddleware');
const { uploadProfileImage } = require('../middlewares/uploadMiddleware');
const router = express.Router();

router.get('/dashboard', requireAuth, userController.getDashboard);
router.get('/profile', requireAuth, userController.getProfilePage);
router.post('/profile', requireAuth, uploadProfileImage.single('profileImage'), userController.updateProfile);

module.exports = router;
