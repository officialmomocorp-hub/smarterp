const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const examService = require('../services/exam.service');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

router.use(authenticate, schoolScoped);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.body, req.schoolId);
    res.status(201).json({ success: true, data: exam });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const { classId, academicYearId, type } = req.query;
    const where = { schoolId: req.schoolId };
    if (classId) where.classId = classId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (type) where.type = type;
    const exams = await prisma.exam.findMany({ where, include: { class: true }, orderBy: { startDate: 'desc' } });
    res.json({ success: true, data: exams });
  } catch (error) { next(error); }
});

router.post('/marks', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const mark = await examService.enterMarks(req.body, req.userId);
    res.status(201).json({ success: true, data: mark });
  } catch (error) { next(error); }
});

router.post('/marks/bulk', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const marks = await examService.bulkEnterMarks(req.body, req.userId);
    res.status(201).json({ success: true, data: marks });
  } catch (error) { next(error); }
});

router.get('/result/student/:studentId', async (req, res, next) => {
  try {
    const { examId } = req.query;
    const result = await examService.getStudentResult(req.params.studentId, examId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/merit-list', async (req, res, next) => {
  try {
    const { examId, classId } = req.query;
    const meritList = await examService.generateMeritList(examId, classId);
    res.json({ success: true, data: meritList });
  } catch (error) { next(error); }
});

router.get('/failed-students', async (req, res, next) => {
  try {
    const { examId, classId } = req.query;
    const failed = await examService.getFailedStudentList(examId, classId);
    res.json({ success: true, data: failed });
  } catch (error) { next(error); }
});

router.post('/:id/publish', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const result = await examService.publishResults(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

module.exports = router;
