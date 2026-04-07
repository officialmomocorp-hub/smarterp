const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, phone, password, role, schoolId]
 *             properties:
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [ADMIN, TEACHER, STUDENT, PARENT] }
 *               schoolId: { type: string }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
const { loginLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { validatePasswordReset, validateResults } = require('../middleware/passwordValidator');

router.post('/register', authenticate, authorize('SUPER_ADMIN'), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [emailOrPhone, password]
 *             properties:
 *               emailOrPhone: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', loginLimiter, authController.login);
router.post('/refresh-token', authenticate, authController.refreshToken);
router.post('/change-password', 
  authenticate, 
  validatePasswordReset, 
  validateResults, 
  authController.changePassword
);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.post('/reset-password', 
  passwordResetLimiter, 
  validatePasswordReset, 
  validateResults, 
  authController.resetPassword
);
router.get('/profile', authenticate, authController.getProfile);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
