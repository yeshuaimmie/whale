const express = require('express');
const pageController = require('../controllers/pageController');
const router = express.Router();

router.get('/', pageController.getHomePage);
router.get('/about', pageController.getAboutPage);

module.exports = router;
