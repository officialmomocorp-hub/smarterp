const Joi = require('joi');

const updateStudent = {
  body: Joi.object().keys({
    profile: Joi.object().keys({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      dateOfBirth: Joi.date().max('now').optional(),
      gender: Joi.string().optional(),
      casteCategory: Joi.string().optional(),
      religion: Joi.string().optional(),
      motherTongue: Joi.string().optional(),
      aadharNumber: Joi.string().optional(),
      nationality: Joi.string().optional(),
    }).optional(),
    bloodGroup: Joi.string().optional(),
    parentData: Joi.object().optional(),
    class: Joi.string().optional(),
    section: Joi.string().optional(),
    rollNumber: Joi.string().optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'DROPPED_OUT', 'GRADUATED').optional()
  }).unknown(false)
};

module.exports = {
  updateStudent
};
