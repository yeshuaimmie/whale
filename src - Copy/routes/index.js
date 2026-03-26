const express = require('express');
const router = express.Router();

router.use('/', require('./pages'));
router.use('/', require('./auth'));
router.use('/', require('./user'));
router.use('/', require('./deposit'));
router.use('/', require('./withdrawal'));
router.use('/', require('./investment'));
router.use('/', require('./referral'));
router.use('/', require('./admin'));
router.use('/', require('./upload'));

module.exports = router;
