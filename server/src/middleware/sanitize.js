const sanitizeHtml = require('sanitize-html');
const { validationResult } = require('express-validator');

const cleanInput = (obj, keyName) => {
  // Skip sanitization for passwords
  if (keyName === 'password') return obj;

  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj, {
        allowedTags: [],
        allowedAttributes: {},
        disallowedTagsMode: 'recursiveEscape'
      }).trim();
    }
    return obj;
  }

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = cleanInput(obj[key], key);
    }
  }
  return obj;
};

const xssSanitizer = (req, res, next) => {
  if (req.body) req.body = cleanInput(req.body);
  if (req.query) req.query = cleanInput(req.query);
  if (req.params) req.params = cleanInput(req.params);
  next();
};

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = {
  xssSanitizer,
  validateResults,
  sanitizeHtml
};
