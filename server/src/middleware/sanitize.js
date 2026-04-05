const sanitizeHtml = require('sanitize-html');
const { body, validationResult } = require('express-validator');

/**
 * Global input sanitization middleware.
 * Recursively sanitizes string fields in req.body, req.query, and req.params using sanitize-html.
 * These sanitization rules are safe and robust for general input fields.
 */
const cleanInput = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      return sanitizeHtml(obj, {
        allowedTags: [], // Strip all HTML tags
        allowedAttributes: {}, // Strip all attributes
        disallowedTagsMode: 'recursiveEscape'
      }).trim();
    }
    return obj;
  }

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = cleanInput(obj[key]);
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

/**
 * Validation Result handler to be used after individual route validations.
 */
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
  sanitizeHtml // Exported to use for fine-grained control in specific routes
};
