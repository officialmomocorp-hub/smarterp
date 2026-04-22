const rateLimit = require('express-rate-limit');

/**
 * Standard Login Rate Limiter.
 * Max 10 login attempts per minute to prevent brute force attacks.
 */
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after a minute.'
  },
  standardHeaders: true, 
  legacyHeaders: false,
});

/**
 * Strict Password Reset Rate Limiter.
 * Max 5 requests per minute to prevent token spamming.
 */
const passwordResetLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    message: 'Too many password reset requests. Please wait a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  passwordResetLimiter
};
