const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const attendanceService = require('../services/attendance.service');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

router.use(authenticate, schoolScoped);

router.post('/mark', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const results = await attendanceService.markAttendance(req.body, req.schoolId, req.userId);
    res.status(201).json({ success: true, data: results });
  } catch (error) { next(error); }
});

router.post('/staff', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const attendance = await attendanceService.markStaffAttendance(req.body, req.schoolId);
    res.status(201).json({ success: true, data: attendance });
  } catch (error) { next(error); }
});

router.get('/student/:studentId', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    // Security Fix: Pass schoolId to service for isolation
    const attendance = await attendanceService.getAttendance(req.params.studentId, startDate, endDate, req.schoolId);
    res.json({ success: true, data: attendance });
  } catch (error) { next(error); }
});

router.get('/class/:classId', async (req, res, next) => {
  try {
    const { sectionId, date } = req.query;
    if (!date) throw new AppError('Date is required', 400);
    // Security Fix: Pass schoolId to verify class/section ownership
    const students = await attendanceService.getClassAttendance(req.params.classId, sectionId, date, req.schoolId);
    res.json({ success: true, data: students });
  } catch (error) { next(error); }
});

router.get('/report/monthly', async (req, res, next) => {
  try {
    const { classId, month, year } = req.query;
    const report = await attendanceService.getMonthlyReport(req.schoolId, classId, parseInt(month), parseInt(year));
    res.json({ success: true, data: report });
  } catch (error) { next(error); }
});

router.get('/alerts', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { academicYearId } = req.query;
    const alerts = await attendanceService.getAttendanceAlerts(req.schoolId, academicYearId);
    res.json({ success: true, data: alerts });
  } catch (error) { next(error); }
});

router.post('/leave', async (req, res, next) => {
  try {
    const leave = await prisma.leaveApplication.create({
      data: {
        schoolId: req.schoolId,
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        appliedBy: req.userId,
      },
    });
    res.status(201).json({ success: true, data: leave });
  } catch (error) { next(error); }
});

router.get('/leave', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { schoolId: req.schoolId };
    if (status) where.status = status;
    if (req.userRole === 'STUDENT' || req.userRole === 'PARENT') {
      where.studentId = req.user.student?.id;
    }
    if (req.userRole === 'TEACHER') {
      where.staffId = req.user.staff?.id;
    }
    const leaves = await prisma.leaveApplication.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: leaves });
  } catch (error) { next(error); }
});

router.put('/leave/:id/approve', authorize('ADMIN', 'SUPER_ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    
    // Security Fix: Verify leave ownership via schoolId
    const existing = await prisma.leaveApplication.findFirst({
      where: { id: req.params.id, schoolId: req.schoolId }
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Leave application not found or unauthorized.' });
    }

    const leave = await prisma.leaveApplication.update({
      where: { id: req.params.id },
      data: { status, rejectionReason, approvedBy: req.userId, approvedAt: new Date() },
    });
    res.json({ success: true, data: leave });
  } catch (error) { next(error); }
});

module.exports = router;
