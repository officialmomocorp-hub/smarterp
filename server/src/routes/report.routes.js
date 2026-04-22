const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');

router.use(authenticate, schoolScoped);

router.get('/student-list', async (req, res, next) => {
  try {
    const { classId, sectionId } = req.query;
    const where = { schoolId: req.schoolId, status: 'ACTIVE' };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    const students = await prisma.student.findMany({
      where,
      include: { profile: true, class: true, section: true },
      orderBy: [{ class: { sortOrder: 'asc' } }, { rollNumber: 'asc' }],
    });
    res.json({ success: true, data: students });
  } catch (error) { next(error); }
});

router.get('/fee-collection', async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { schoolId: req.schoolId, paymentDate: { not: null } };
    if (startDate && endDate) {
      where.paymentDate = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    const payments = await prisma.feePayment.findMany({
      where,
      include: { student: { include: { profile: true, class: true } } },
      orderBy: { paymentDate: 'desc' },
    });
    res.json({ success: true, data: payments });
  } catch (error) { next(error); }
});

router.get('/attendance-report', async (req, res, next) => {
  try {
    const { classId, month, year } = req.query;
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const attendance = await prisma.attendance.findMany({
      where: {
        schoolId: req.schoolId,
        date: { gte: startDate, lte: endDate },
        student: { classId: classId || undefined },
      },
      include: { student: { include: { profile: true, class: true, section: true } } },
    });
    res.json({ success: true, data: attendance });
  } catch (error) { next(error); }
});

router.get('/udise-format', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId: req.schoolId, isCurrent: true },
    });
    const students = await prisma.student.findMany({
      where: { schoolId: req.schoolId, academicYearId: currentYear?.id, status: 'ACTIVE' },
      include: { profile: true, class: true, section: true, parents: { include: { parent: true } } },
    });
    const udiseData = students.map(s => ({
      studentId: s.studentId,
      name: `${s.profile.firstName} ${s.profile.lastName}`,
      dob: s.profile.dateOfBirth,
      gender: s.profile.gender,
      casteCategory: s.profile.casteCategory,
      religion: s.profile.religion,
      aadharNumber: s.profile.aadharNumber,
      class: s.class.name,
      section: s.section.name,
      fatherName: s.parents[0]?.parent.fatherName,
      motherName: s.parents[0]?.parent.motherName,
      bplStatus: s.bplStatus,
      rteSeat: s.rteSeat,
      midDayMeal: s.midDayMealOpted,
    }));
    res.json({ success: true, data: udiseData });
  } catch (error) { next(error); }
});

router.get('/annual-report', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId: req.schoolId, isCurrent: true },
    });
    const [totalStudents, totalStaff, totalFeeCollected, avgAttendance] = await Promise.all([
      prisma.student.count({ where: { schoolId: req.schoolId, academicYearId: currentYear?.id, status: 'ACTIVE' } }),
      prisma.staff.count({ where: { schoolId: req.schoolId, status: 'Active' } }),
      prisma.feePayment.aggregate({
        where: { schoolId: req.schoolId, academicYearId: currentYear?.id, paymentDate: { not: null } },
        _sum: { paidAmount: true },
      }),
      prisma.attendance.groupBy({
        by: ['status'],
        where: { schoolId: req.schoolId },
        _count: true,
      }),
    ]);
    res.json({
      success: true,
      data: {
        academicYear: currentYear,
        totalStudents,
        totalStaff,
        totalFeeCollected: totalFeeCollected._sum.paidAmount || 0,
        attendanceBreakdown: avgAttendance,
      },
    });
  } catch (error) { next(error); }
});

module.exports = router;
