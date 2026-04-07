const Joi = require('joi');

const createClass = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    sortOrder: Joi.number().integer().optional(),
    academicYearId: Joi.string().required()
  }).unknown(false)
};

const createSection = {
  body: Joi.object().keys({
    classId: Joi.string().required(),
    name: Joi.string().required(),
    roomNumber: Joi.string().optional(),
    capacity: Joi.number().integer().optional()
  }).unknown(false)
};

const createSubject = {
  body: Joi.object().keys({
    classId: Joi.string().required(),
    name: Joi.string().required(),
    code: Joi.string().optional(),
    description: Joi.string().optional(),
    isElective: Joi.boolean().optional(),
    creditHours: Joi.number().optional()
  }).unknown(false)
};

const createAcademicYear = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().min(Joi.ref('startDate')).required(),
    isCurrent: Joi.boolean().optional()
  }).unknown(false)
};

const createHomework = {
  body: Joi.object().keys({
    classId: Joi.string().required(),
    sectionId: Joi.string().required(),
    subjectId: Joi.string().required(),
    title: Joi.string().required(),
    description: Joi.string().required(),
    dueDate: Joi.date().min('now').required(),
    maxMarks: Joi.number().optional()
  }).unknown(false)
};

module.exports = {
  createClass,
  createSection,
  createSubject,
  createAcademicYear,
  createHomework
};
