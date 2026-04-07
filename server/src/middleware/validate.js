const { AppError } = require('../utils/appError');

const Joi = require('joi');

const validate = (schema) => {
  return async (req, res, next) => {
    try {
      const validSchema = Joi.object(schema);
      const payload = {
        body: req.body,
        query: req.query,
        params: req.params,
      };

      const result = await validSchema.validateAsync(payload, { abortEarly: false, stripUnknown: true });
      req.body = result.body !== undefined ? result.body : req.body;
      req.query = result.query !== undefined ? result.query : req.query;
      req.params = result.params !== undefined ? result.params : req.params;
      next();
    } catch (error) {
      if (error.details) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        }));
        return next(new AppError('Validation failed', 400, errors));
      }
      return next(error);
    }
  };
};

module.exports = { validate };
