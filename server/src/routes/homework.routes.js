const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

router.use(authenticate, schoolScoped);

// ==========================================
// FEATURE 8: HOMEWORK MANAGEMENT
// ==========================================

// Assign homework
router.post('/homework', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { subjectId, classId, sectionId, title, description, dueDate, maxMarks, attachmentUrl } = req.body;

    const homework = await prisma.homework.create({
      data: {
        schoolId: req.schoolId,
        subjectId,
        classId,
        sectionId,
        title,
        description,
        dueDate: new Date(dueDate),
        maxMarks,
        attachmentUrl,
        assignedBy: req.userId,
      },
      include: { subject: true, class: true },
    });

    res.status(201).json({ success: true, data: homework });
  } catch (error) { next(error); }
});

// Get homework for class
router.get('/homework', async (req, res, next) => {
  try {
    const { classId, sectionId, subjectId, date } = req.query;
    const where = { schoolId: req.schoolId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    if (subjectId) where.subjectId = subjectId;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      where.dueDate = { gte: d, lt: nextD };
    }

    const homework = await prisma.homework.findMany({
      where,
      include: { subject: true, submissions: true },
      orderBy: { dueDate: 'asc' },
    });

    res.json({ success: true, data: homework });
  } catch (error) { next(error); }
});

// Submit homework
router.post('/homework/:id/submit', async (req, res, next) => {
  try {
    const { submissionUrl, remarks } = req.body;

    const submission = await prisma.homeworkSubmission.upsert({
      where: {
        homeworkId_studentId: {
          homeworkId: req.params.id,
          studentId: req.user.student?.id,
        },
      },
      update: { submissionUrl, remarks, submittedAt: new Date() },
      create: {
        homeworkId: req.params.id,
        studentId: req.user.student?.id,
        submissionUrl,
        remarks,
      },
    });

    res.json({ success: true, data: submission });
  } catch (error) { next(error); }
});

// Grade homework
router.post('/homework/:id/grade/:studentId', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const { marksObtained, remarks } = req.body;

    const submission = await prisma.homeworkSubmission.update({
      where: {
        homeworkId_studentId: {
          homeworkId: req.params.id,
          studentId: req.params.studentId,
        },
      },
      data: {
        marksObtained,
        remarks,
        gradedAt: new Date(),
        gradedBy: req.userId,
      },
    });

    res.json({ success: true, data: submission });
  } catch (error) { next(error); }
});

// Overdue homework
router.get('/homework/overdue', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const overdue = await prisma.homework.findMany({
      where: {
        schoolId: req.schoolId,
        dueDate: { lt: new Date() },
      },
      include: {
        subject: true,
        class: true,
        submissions: true,
      },
      orderBy: { dueDate: 'asc' },
    });

    const overdueList = overdue.map(h => ({
      ...h,
      pendingSubmissions: h.submissions.length === 0,
    }));

    res.json({ success: true, data: overdueList });
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 10: LEAVE MANAGEMENT (STAFF)
// ==========================================

// Apply for leave
router.post('/leave/apply', async (req, res, next) => {
  try {
    const { startDate, endDate, leaveType, reason, attachmentUrl } = req.body;

    const leave = await prisma.leaveApplication.create({
      data: {
        schoolId: req.schoolId,
        staffId: req.user.staff?.id,
        userId: req.userId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType,
        reason,
        attachmentUrl,
        appliedBy: req.userId,
      },
    });

    res.status(201).json({ success: true, data: leave });
  } catch (error) { next(error); }
});

// Approve/reject leave
router.put('/leave/:id/approve', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;

    const leave = await prisma.leaveApplication.update({
      where: { id: req.params.id },
      data: {
        status,
        rejectionReason,
        approvedBy: req.userId,
        approvedAt: new Date(),
      },
    });

    res.json({ success: true, data: leave });
  } catch (error) { next(error); }
});

// Get leave balance
router.get('/leave/balance/:staffId', async (req, res, next) => {
  try {
    const year = new Date().getFullYear();
    const leaves = await prisma.leaveApplication.findMany({
      where: {
        staffId: req.params.staffId,
        startDate: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) },
        status: 'APPROVED',
      },
    });

    const clUsed = leaves.filter(l => l.leaveType === 'CL').length;
    const elUsed = leaves.filter(l => l.leaveType === 'EL').length;
    const slUsed = leaves.filter(l => l.leaveType === 'ML' || l.leaveType === 'MEDICAL').length;

    res.json({
      success: true,
      data: {
        cl: { total: 12, used: clUsed, balance: 12 - clUsed },
        el: { total: 15, used: elUsed, balance: 15 - elUsed },
        sl: { total: 10, used: slUsed, balance: 10 - slUsed },
        ml: { total: 180, used: 0, balance: 180 },
      },
    });
  } catch (error) { next(error); }
});

// Leave calendar (who is on leave today)
router.get('/leave/calendar', async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const onLeave = await prisma.leaveApplication.findMany({
      where: {
        schoolId: req.schoolId,
        status: 'APPROVED',
        startDate: { lte: today },
        endDate: { gte: today },
      },
      include: { staff: true },
    });

    res.json({ success: true, data: onLeave });
  } catch (error) { next(error); }
});

module.exports = router;
