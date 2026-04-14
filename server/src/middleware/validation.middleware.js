const { body, validationResult } = require('express-validator');

const loginValidation = [
  body('password').notEmpty().withMessage('Password is required'),
];

const validateResults = (req, res, next) => {
  console.log('Validating login request:', req.body);
  if (!req.body.username && !req.body.emailOrPhone) {
    return res.status(400).json({ 
        status: 'error', 
        message: 'Validation failed', 
        errors: [{ msg: 'Email, Phone or Username is required', path: 'emailOrPhone' }] 
    });
  }
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
  }

  if (!req.body.username && req.body.emailOrPhone) {
    req.body.username = req.body.emailOrPhone;
  }
  
  next();
};

module.exports = {
  loginValidation,
  validateResults,
};
