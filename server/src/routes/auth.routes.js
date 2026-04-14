const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { loginValidation, validateResults } = require('../middleware/validation.middleware');
const { authenticate } = require('../middleware/auth.middleware');

router.post('/login', loginValidation, validateResults, authController.login);
router.post('/register-school', authController.registerSchool);
router.post('/logout', authenticate, authController.logout);

module.exports = router;
