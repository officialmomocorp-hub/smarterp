const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');

router.use(authenticate, schoolScoped);

router.get('/classes', async (req, res, next) => {
  try {
    const { academicYearId } = req.query;
    const where = { schoolId: req.schoolId };
    if (academicYearId) where.academicYearId = academicYearId;
    const classes = await prisma.class.findMany({
      where, include: { sections: true, subjects: true }, orderBy: { sortOrder: 'asc' },
    });
    res.json({ success: true, data: classes });
  } catch (error) { next(error); }
});

router.post('/classes', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const cls = await prisma.class.create({ data: { schoolId: req.schoolId, ...req.body } });
    res.status(201).json({ success: true, data: cls });
  } catch (error) { next(error); }
});

router.post('/sections', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { classId, name } = req.body;
    const targetClass = await prisma.class.findFirst({
      where: { id: classId, schoolId: req.schoolId }
    });
    if (!targetClass) {
      return res.status(404).json({ success: false, message: 'Class not found or does not belong to your school.' });
    }
    const existing = await prisma.section.findFirst({
      where: { classId, name: name.trim().toUpperCase() }
    });
    if (existing) {
      return res.status(400).json({ success: false, message: `Section ${name} already exists for this class.` });
    }
    const section = await prisma.section.create({ data: { ...req.body, name: name.trim().toUpperCase() } });
    res.status(201).json({ success: true, data: section });
  } catch (error) { next(error); }
});

router.get('/subjects', async (req, res, next) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { class: { schoolId: req.schoolId } },
      include: { class: true },
    });
    res.json({ success: true, data: subjects });
  } catch (error) { next(error); }
});

router.post('/subjects', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { description, classId, ...subjectData } = req.body;
    const targetClass = await prisma.class.findFirst({
      where: { id: classId, schoolId: req.schoolId }
    });
    if (!targetClass) {
      return res.status(404).json({ success: false, message: 'Class not found or does not belong to your school.' });
    }
    const subject = await prisma.subject.create({ data: { classId, ...subjectData } });
    res.status(201).json({ success: true, data: subject });
  } catch (error) { next(error); }
});

router.get('/academic-years', async (req, res, next) => {
  try {
    const years = await prisma.academicYear.findMany({
      where: { schoolId: req.schoolId },
      orderBy: { startDate: 'desc' },
    });
    res.json({ success: true, data: years });
  } catch (error) { next(error); }
});

router.post('/academic-years', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const year = await prisma.academicYear.create({
      data: {
        schoolId: req.schoolId,
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      }
    });
    res.status(201).json({ success: true, data: year });
  } catch (error) { next(error); }
});

router.post('/homework', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const homework = await prisma.homework.create({
      data: {
        schoolId: req.schoolId,
        ...req.body,
        dueDate: new Date(req.body.dueDate),
        assignedBy: req.userId,
      },
    });
    res.status(201).json({ success: true, data: homework });
  } catch (error) { next(error); }
});

router.post('/homework/:id/submit', async (req, res, next) => {
  try {
    const submission = await prisma.homeworkSubmission.upsert({
      where: { homeworkId_studentId: { homeworkId: req.params.id, studentId: req.user.student?.id } },
      update: { submissionUrl: req.body.submissionUrl, submittedAt: new Date() },
      create: {
        homeworkId: req.params.id,
        studentId: req.user.student?.id,
        submissionUrl: req.body.submissionUrl,
      },
    });
    res.status(201).json({ success: true, data: submission });
  } catch (error) { next(error); }
});

router.post('/study-material', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const material = await prisma.studyMaterial.create({
      data: { schoolId: req.schoolId, ...req.body, uploadedBy: req.userId },
    });
    res.status(201).json({ success: true, data: material });
  } catch (error) { next(error); }
});

module.exports = router;
