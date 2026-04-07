const Joi = require('joi');

const createAdmission = {
  body: Joi.object().keys({
    applicantName: Joi.string().required(),
    dateOfBirth: Joi.date().required(),
    gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').required(),
    classApplied: Joi.string().required(),
    sectionPreferred: Joi.string().optional(),
    aadharNumber: Joi.string().optional(),
    fatherName: Joi.string().required(),
    fatherPhone: Joi.string().required(),
    motherName: Joi.string().optional(),
    motherPhone: Joi.string().optional(),
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().required(),
    academicYearId: Joi.string().optional(),
    previousSchool: Joi.string().optional(),
    tcNumber: Joi.string().optional(),
    tcDate: Joi.date().optional(),
    annualIncome: Joi.number().optional()
  }).unknown(true) // Allow for extra fields if needed
};

const updateStatus = {
  body: Joi.object().keys({
    status: Joi.string().valid('SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED', 'CONVERTED').required(),
    remarks: Joi.string().allow('', null).optional()
  })
};

module.exports = {
  createAdmission,
  updateStatus
};
