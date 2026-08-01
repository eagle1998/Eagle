const express = require('express');
const router = express.Router();
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { authMiddleware } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/verify', authController.verify);
router.patch('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
