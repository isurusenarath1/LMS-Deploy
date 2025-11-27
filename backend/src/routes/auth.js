const express = require('express');
const router = express.Router();
const { register, login, me, refreshToken, logout, verifyOtp, resendOtp } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.get('/me', auth, me);
router.post('/refresh-token', auth, refreshToken);
router.post('/logout', logout);

module.exports = router;
