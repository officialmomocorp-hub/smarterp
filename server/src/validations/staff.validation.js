const Joi = require('joi');

const createStaff = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().optional(),
    phone: Joi.string().required(),
    email: Joi.string().email().optional(),
    designation: Joi.string().required(),
    department: Joi.string().required(),
    qualification: Joi.string().optional(),
    dateOfJoining: Joi.date().optional(),
    basicPay: Joi.number().optional(),
    specialization: Joi.string().optional(),
    experience: Joi.number().optional(),
    employmentType: Joi.string().valid('Permanent', 'Contract', 'Part-time').optional()
  }).unknown(false)
};

const updateStaff = {
  body: Joi.object().keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    designation: Joi.string().optional(),
    department: Joi.string().optional(),
    qualification: Joi.string().optional(),
    dateOfJoining: Joi.date().optional(),
    basicPay: Joi.number().optional(),
    specialization: Joi.string().optional(),
    experience: Joi.number().optional(),
    employmentType: Joi.string().valid('Permanent', 'Contract', 'Part-time').optional(),
    status: Joi.string().valid('ACTIVE', 'INACTIVE', 'TERMINATED', 'RESIGNED', 'ON_LEAVE').optional()
  }).unknown(false)
};

module.exports = {
  createStaff,
  updateStaff
};

