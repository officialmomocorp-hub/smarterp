const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

router.use(authenticate, schoolScoped);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    let yearId = req.body.academicYearId;
    if (!yearId) {
      const activeYear = await prisma.academicYear.findFirst({
        where: { schoolId: req.schoolId, isCurrent: true }
      });
      yearId = activeYear?.id;
    }
    if (!yearId) throw new AppError('No active academic year found', 400);

    const admissionNumber = `ADM${Date.now().toString().slice(-6)}`;

    const admission = await prisma.admission.create({
      data: {
        schoolId: req.schoolId,
        academicYearId: yearId,
        admissionNumber,
        ...req.body,
        dateOfBirth: new Date(req.body.dateOfBirth),
        tcDate: req.body.tcDate ? new Date(req.body.tcDate) : null,
        annualIncome: req.body.annualIncome ? parseFloat(req.body.annualIncome) : null,
      },
    });
    res.status(201).json({ success: true, data: admission });
  } catch (error) { next(error); }
});

router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const where = { schoolId: req.schoolId };
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { applicantName: { contains: search } },
        { admissionNumber: { contains: search } },
      ];
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [admissions, total] = await Promise.all([
      prisma.admission.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.admission.count({ where }),
    ]);
    res.json({ success: true, data: { admissions, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const admission = await prisma.admission.findFirst({ where: { id: req.params.id, schoolId: req.schoolId } });
    if (!admission) throw new AppError('Admission not found', 404);
    res.json({ success: true, data: admission });
  } catch (error) { next(error); }
});

router.put('/:id/status', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    const admission = await prisma.admission.update({
      where: { id: req.params.id },
      data: { status, remarks, processedAt: new Date(), processedBy: req.userId },
    });
    res.json({ success: true, data: admission });
  } catch (error) { next(error); }
});

router.post('/:id/convert-to-student', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const admission = await prisma.admission.findUnique({ where: { id: req.params.id } });
    if (!admission || admission.status !== 'APPROVED') {
      throw new AppError('Admission must be approved before conversion', 400);
    }
    if (admission.studentId) {
      throw new AppError('Already converted to student', 400);
    }
    res.json({ success: true, message: 'Use student creation API with admission reference' });
  } catch (error) { next(error); }
});

module.exports = router;
