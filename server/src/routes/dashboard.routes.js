const express = require('express');
const router = express.Router();
const prisma = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/super-admin', authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const [
      totalSchools,
      activeSchools,
      totalStudents,
      totalStaff,
      recentSchools,
      paymentSummary
    ] = await Promise.all([
      prisma.school.count(),
      prisma.school.count({ where: { isActive: true } }),
      prisma.student.count(),
      prisma.staff.count(),
      prisma.school.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        take: 5,
        select: { id: true, name: true, city: true, createdAt: true, isActive: true }
      }),
      prisma.feePayment.aggregate({
        _sum: { paidAmount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalSchools,
        activeSchools,
        totalStudents,
        totalStaff,
        recentSchools,
        totalRevenue: paymentSummary._sum.paidAmount || 0,
        unpaidSchoolsCount: 0 // To be implemented with billing module
      }
    });
  } catch (error) { next(error); }
});

router.get('/admin', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId: req.schoolId, isCurrent: true }
    });

    if (!currentYear) {
      return res.json({ success: true, data: {} });
    }

    const [
      totalStudents,
      classWiseStudents,
      genderWiseStudents,
      todayAttendance,
      todayFeeCollection,
      monthlyFeeCollection,
      totalFeeCollection,
      defaulterCount,
      staffPresent,
      totalStaff,
      pendingAdmissions,
    ] = await Promise.all([
      prisma.student.count({ where: { schoolId: req.schoolId, academicYearId: currentYear.id, status: 'ACTIVE' } }),
      prisma.student.groupBy({
        by: ['classId'],
        where: { schoolId: req.schoolId, academicYearId: currentYear.id, status: 'ACTIVE' },
        _count: true,
      }),
      (async () => {
        const students = await prisma.student.findMany({
          where: { schoolId: req.schoolId, academicYearId: currentYear.id, status: 'ACTIVE' },
          select: { studentProfile: { select: { gender: true } } },
        });
        const genderMap = {};
        students.forEach(s => {
          const g = s.studentProfile?.gender || 'UNKNOWN';
          genderMap[g] = (genderMap[g] || 0) + 1;
        });
        return Object.entries(genderMap).map(([gender, count]) => ({ profile: { gender }, _count: count }));
      })(),
      prisma.attendance.groupBy({
        by: ['status'],
        where: {
          schoolId: req.schoolId,
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)), lte: new Date(new Date().setHours(23, 59, 59, 999)) },
        },
        _count: true,
      }),
      prisma.feePayment.aggregate({
        where: {
          schoolId: req.schoolId,
          paymentDate: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: {
          schoolId: req.schoolId,
          paymentDate: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.aggregate({
        where: {
          schoolId: req.schoolId,
          academicYearId: currentYear.id,
          paymentDate: { not: null },
        },
        _sum: { paidAmount: true },
      }),
      prisma.feePayment.count({
        where: {
          schoolId: req.schoolId,
          academicYearId: currentYear.id,
          status: { in: ['PENDING', 'OVERDUE'] },
          balanceAmount: { gt: 0 },
        },
      }),
      prisma.attendance.count({
        where: {
          schoolId: req.schoolId,
          date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
          status: 'PRESENT',
          staffId: { not: null },
        },
      }),
      prisma.staff.count({ where: { schoolId: req.schoolId, status: 'Active' } }),
      prisma.admission.count({ where: { schoolId: req.schoolId, status: 'PENDING' } }),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        classWiseStudents,
        genderWiseStudents,
        todayAttendance,
        todayFeeCollection: todayFeeCollection._sum.paidAmount || 0,
        monthlyFeeCollection: monthlyFeeCollection._sum.paidAmount || 0,
        totalFeeCollection: totalFeeCollection._sum.paidAmount || 0,
        defaulterCount,
        staffPresent,
        totalStaff,
        pendingAdmissions,
      },
    });
  } catch (error) { next(error); }
});

router.get('/teacher', authorize('TEACHER'), async (req, res, next) => {
  try {
    const today = new Date().getDay();
    const [myClasses, pendingMarks, myAttendance] = await Promise.all([
      prisma.timetable.findMany({
        where: { teacherId: req.userId, dayOfWeek: today },
        include: { class: true, section: true, subject: true },
        orderBy: { period: 'asc' },
      }),
      prisma.exam.count({
        where: {
          resultsPublished: false,
          class: { subjects: { some: { teacherId: req.userId } } },
        },
      }),
      prisma.attendance.findMany({
        where: {
          userId: req.userId,
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ]);

    const presentDays = myAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = myAttendance.length > 0
      ? ((presentDays / myAttendance.length) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      data: {
        myClasses,
        pendingMarks,
        attendanceSummary: {
          totalDays: myAttendance.length,
          presentDays,
          attendancePercentage,
        },
      },
    });
  } catch (error) { next(error); }
});

router.get('/parent', authorize('PARENT'), async (req, res, next) => {
  try {
    const parent = await prisma.parent.findFirst({
      where: { userId: req.userId },
      include: {
        students: {
          include: {
            student: {
              include: {
                studentProfile: true,
                class: true,
                section: true,
                feePayments: { orderBy: { createdAt: 'desc' }, take: 5 },
              },
            },
          },
        },
      },
    });

    if (!parent) {
      return res.json({ success: true, data: {} });
    }

    const childrenData = await Promise.all(
      parent.students.map(async (ps) => {
        const student = ps.student;
        const attendance = await prisma.attendance.findMany({
          where: { studentId: student.id },
        });

        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
        const attendancePercentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;

        const totalFees = student.feePayments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0);
        const paidFees = student.feePayments.reduce((sum, p) => sum + parseFloat(p.paidAmount), 0);
        const balance = totalFees - paidFees;

        return {
          student,
          attendancePercentage,
          feeBalance: balance,
        };
      })
    );

    const notices = await prisma.notice.findMany({
      where: { schoolId: req.schoolId, isActive: true },
      orderBy: { publishDate: 'desc' },
      take: 10,
    });

    res.json({
      success: true,
      data: {
        children: childrenData,
        notices,
      },
    });
  } catch (error) { next(error); }
});

router.get('/student', authorize('STUDENT'), async (req, res, next) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.userId },
      include: {
        studentProfile: true,
        class: true,
        section: true,
      }
    });

    if (!student) {
      return res.json({ success: true, data: {} });
    }

    const today = new Date().getDay();
    const [myTimetable, myAttendance, recentHomework, feePayments, notices] = await Promise.all([
      prisma.timetable.findMany({
        where: { 
          classId: student.classId, 
          sectionId: student.sectionId,
          dayOfWeek: today 
        },
        include: { subject: true },
        orderBy: { period: 'asc' },
      }),
      prisma.attendance.findMany({
        where: {
          studentId: student.id,
          date: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      prisma.homework.findMany({
        where: {
          classId: student.classId,
          sectionId: student.sectionId,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { subject: true }
      }),
      prisma.feePayment.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notice.findMany({
        where: { schoolId: student.schoolId, isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    const totalDays = myAttendance.length;
    const presentDays = myAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    const totalFees = feePayments.reduce((sum, p) => sum + parseFloat(p.totalAmount), 0);
    const paidFees = feePayments.reduce((sum, p) => sum + parseFloat(p.paidAmount), 0);
    const feeBalance = totalFees - paidFees;

    res.json({
      success: true,
      data: {
        profile: student.studentProfile || { firstName: 'Student', lastName: '' },
        class: student.class,
        section: student.section,
        timetable: myTimetable,
        attendanceSummary: {
          totalDays,
          presentDays,
          attendancePercentage
        },
        feeSummary: {
          totalFees,
          paidFees,
          feeBalance
        },
        homework: recentHomework,
        notices
      }
    });
  } catch (error) { next(error); }
});

module.exports = router;
