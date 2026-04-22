const Joi = require('joi');

const createExam = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().valid('UNIT_TEST', 'HALF_YEARLY', 'FINAL', 'PRACTICAL', 'ASSIGNMENT').required(),
    academicYearId: Joi.string().required(),
    classId: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    maxMarks: Joi.number().optional(),
    passingMarks: Joi.number().optional()
  }).unknown(false)
};

const enterMarks = {
  body: Joi.object().keys({
    examId: Joi.string().required(),
    studentId: Joi.string().required(),
    subjectId: Joi.string().required(),
    marksObtained: Joi.number().min(0).required(),
    remarks: Joi.string().optional()
  }).unknown(false)
};

const bulkEnterMarks = {
  body: Joi.object().keys({
    examId: Joi.string().required(),
    subjectId: Joi.string().required(),
    marks: Joi.array().items(
      Joi.object().keys({
        studentId: Joi.string().required(),
        marksObtained: Joi.number().min(0).required(),
        remarks: Joi.string().optional()
      }).unknown(false)
    ).min(1).required()
  }).unknown(false)
};

module.exports = {
  createExam,
  enterMarks,
  bulkEnterMarks
};
