const express = require('express');
const router = express.Router();
const { authenticate, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');

router.get('/super-admin', authenticate, async (req, res, next) => {
  try {
    if (req.userRole !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const [totalSchools, totalStudents, totalStaff, recentSchools, inactiveSchools, allSchools] = await Promise.all([
      prisma.school.count(),
      prisma.student.count(),
      prisma.staff.count(),
      prisma.school.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, city: true, createdAt: true, isActive: true }
      }),
      prisma.school.count({ where: { isActive: false } }),
      prisma.school.findMany({ select: { createdAt: true } })
    ]);

    // Calculate real revenue trend based on school creation dates
    // Assume MRR of ₹15,000 per school
    const MRR_PER_SCHOOL = 15000;
    
    // Initialize last 6 months
    const months = [];
    const revenueTrend = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d.toLocaleString('default', { month: 'short' }));
        
        // Count schools created on or before this month
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const schoolsUpToMonth = allSchools.filter(s => new Date(s.createdAt) <= endOfMonth).length;
        revenueTrend.push(schoolsUpToMonth * MRR_PER_SCHOOL);
    }

    res.json({
      success: true,
      data: {
        totalSchools,
        activeSchools: totalSchools - inactiveSchools,
        unpaidSchoolsCount: inactiveSchools,
        totalStudentsAcross: totalStudents,
        totalStaffAcross: totalStaff,
        recentSchools,
        totalRevenue: (totalSchools - inactiveSchools) * MRR_PER_SCHOOL,
        revenueTrend,
        trendLabels: months
      }
    });
  } catch (error) { next(error); }
});

router.use(authenticate, schoolScoped);


router.get('/admin', async (req, res, next) => {
  try {
    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId: req.schoolId, isCurrent: true },
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
          select: { profile: { select: { gender: true } } },
        });
        const genderMap = {};
        students.forEach(s => {
          const g = s.profile?.gender || 'UNKNOWN';
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

router.get('/teacher', async (req, res, next) => {
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

router.get('/parent', async (req, res, next) => {
  try {
    const parent = await prisma.parent.findFirst({
      where: { userId: req.userId },
      include: {
        students: {
          include: {
            student: {
              include: {
                profile: true,
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

router.get('/student', async (req, res, next) => {
  try {
    const student = await prisma.student.findFirst({
      where: { userId: req.userId },
      include: {
        profile: true,
        class: true,
        section: true,
      }
    });

    if (!student) {
      return res.json({ success: true, data: {} });
    }

    const today = new Date().getDay();
    const [myTimetable, myAttendance, recentHomework] = await Promise.all([
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
      })
    ]);

    const totalDays = myAttendance.length;
    const presentDays = myAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        profile: student.profile,
        class: student.class,
        section: student.section,
        timetable: myTimetable,
        attendanceSummary: {
          totalDays,
          presentDays,
          attendancePercentage
        },
        homework: recentHomework
      }
    });
  } catch (error) { next(error); }
});

module.exports = router;
