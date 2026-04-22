const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');

/**
 * Reusable Password Complexity + History Validator.
 * Rules:
 * 1. Min 8 characters
 * 2. At least 1 uppercase letter
 * 3. At least 1 number
 * 4. At least 1 special character (@$!%*?&)
 * 5. Not allowed to reuse any of the last 3 passwords.
 */
const validatePasswordReset = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/(?=.*[A-Z])/)
    .withMessage('Password must contain at least one uppercase letter.')
    .matches(/(?=.*[0-9])/)
    .withMessage('Password must contain at least one number.')
    .matches(/(?=.*[@$!%*?&])/)
    .withMessage('Password must contain at least one special character.')
    .custom(async (value, { req }) => {
      // Find the user's password history (for logged-in users or during reset)
      const targetUserId = req.userId || req.body.userId;
      if (!targetUserId) return true; // Skip history check for initial registration

      const history = await prisma.passwordHistory.findMany({
        where: { userId: targetUserId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      });

      for (const entry of history) {
        const isMatch = await bcrypt.compare(value, entry.hashedPassword);
        if (isMatch) {
          throw new Error('New password cannot be the same as any of your last 3 passwords.');
        }
      }
      return true;
    }),
];

const { validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = {
  validatePasswordReset,
  validateResults
};
