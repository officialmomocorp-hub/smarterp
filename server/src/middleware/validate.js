const { AppError } = require('../utils/appError');

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const schemaToUse = schema[req.method.toLowerCase()];
      if (!schemaToUse) return next();

      await schemaToUse.validateAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      }, { abortEarly: false });

      next();
    } catch (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      next(new AppError('Validation failed', 400, errors));
    }
  };
};

module.exports = { validate };
