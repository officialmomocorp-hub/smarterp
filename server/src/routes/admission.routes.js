const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const admissionValidation = require('../validations/admission.validation');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');
const { logAction, Actions, Resources } = require('../utils/auditLogger');

router.use(authenticate, schoolScoped);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), validate(admissionValidation.createAdmission), async (req, res, next) => {
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
    await logAction({
      schoolId: req.schoolId,
      userId: req.userId,
      action: Actions.CREATE,
      resource: Resources.ADMISSION,
      resourceId: admission.id,
      newValue: admission,
      req,
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

router.get('/stats', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const stats = await prisma.admission.groupBy({
      by: ['status'],
      where: { schoolId: req.schoolId },
      _count: true
    });
    
    const formattedStats = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      WAITLISTED: 0,
      CONVERTED: 0,
    };
    
    stats.forEach(s => {
      formattedStats[s.status] = s._count;
    });
    
    res.json({ success: true, data: formattedStats });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const admission = await prisma.admission.findFirst({ where: { id: req.params.id, schoolId: req.schoolId } });
    if (!admission) throw new AppError('Admission not found', 404);
    res.json({ success: true, data: admission });
  } catch (error) { next(error); }
});

router.put('/:id/status', authorize('SUPER_ADMIN', 'ADMIN'), validate(admissionValidation.updateStatus), async (req, res, next) => {
  try {
    const { status, remarks } = req.body;
    
    // Security Fix: Guard update with schoolId check
    const existing = await prisma.admission.findFirst({
      where: { id: req.params.id, schoolId: req.schoolId }
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Admission record not found or unauthorized.' });
    }

    const admission = await prisma.admission.update({
      where: { id: req.params.id },
      data: { status, remarks, processedAt: new Date(), processedBy: req.userId },
    });
    await logAction({
      schoolId: req.schoolId,
      userId: req.userId,
      action: Actions.UPDATE,
      resource: Resources.ADMISSION,
      resourceId: req.params.id,
      oldValue: existing,
      newValue: admission,
      req,
    });
    res.json({ success: true, data: admission });
  } catch (error) { next(error); }
});

const studentService = require('../services/student.service');

router.post('/:id/convert-to-student', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const student = await studentService.convertFromAdmission(req.params.id, req.schoolId, req.userId, req);
    
    await logAction({
        schoolId: req.schoolId,
        userId: req.userId,
        action: Actions.UPDATE,
        resource: Resources.ADMISSION,
        resourceId: req.params.id,
        newValue: { status: 'CONVERTED' },
        req,
      });

    res.json({ success: true, data: student, message: 'Converted to student successfully' });
  } catch (error) { next(error); }
});

module.exports = router;
