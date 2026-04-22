const Joi = require('joi');

const createFeeStructure = {
  body: Joi.object().keys({
    name: Joi.string().optional(),
    class: Joi.string().required(),
    academicYear: Joi.string().required(),
    feeHeads: Joi.alternatives().try(
      Joi.array().items(
        Joi.object().keys({
          name: Joi.string().required(),
          amount: Joi.number().required()
        })
      ),
      Joi.string()
    ).required(),
    installmentType: Joi.string().valid('MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUALLY', 'ONE_TIME').default('QUARTERLY'),
    dueDates: Joi.alternatives().try(
      Joi.array().items(
        Joi.object().keys({
          date: Joi.date().required(),
          amount: Joi.number().required()
        })
      ),
      Joi.string()
    ).required(),
    lateFinePerDay: Joi.number().default(0),
    gstPercentage: Joi.number().default(0),
    classId: Joi.string().optional(),
    academicYearId: Joi.string().optional()
  })
};

const processPayment = {
  body: Joi.object().keys({
    studentId: Joi.string().required(),
    feeStructureId: Joi.string().required(),
    installmentNumber: Joi.number().integer().min(1).required(),
    paymentMode: Joi.string().valid('CASH', 'ONLINE', 'BANK_TRANSFER', 'CHEQUE', 'RAZORPAY').default('CASH'),
    transactionId: Joi.string().allow('', null).optional(),
    amount: Joi.number().min(0).optional(),
    concessionId: Joi.string().allow('', null).optional(),
    concessionIds: Joi.array().items(Joi.string()).optional(),
    remarks: Joi.string().allow('', null).optional()
  })
};

const createConcession = {
  body: Joi.object().keys({
    feeStructureId: Joi.string().required(),
    name: Joi.string().required(),
    type: Joi.string().required(),
    discountType: Joi.string().valid('FLAT', 'PERCENTAGE').required(),
    discountValue: Joi.number().min(0).required(),
    applicableCaste: Joi.array().items(Joi.string()).optional(),
    applicableIncome: Joi.number().optional(),
    maxDiscountAmount: Joi.number().optional(),
    description: Joi.string().optional()
  })
};

module.exports = {
  createFeeStructure,
  processPayment,
  createConcession
};
