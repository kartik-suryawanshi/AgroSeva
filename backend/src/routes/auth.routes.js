const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimiter.middleware');
const { requireAuth } = require('../middlewares/auth.middleware');

router.post('/register', authLimiter, authController.register);
router.post('/verify-otp', authLimiter, authController.verifyOtp);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
