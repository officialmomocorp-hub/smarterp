const express = require('express');
const router = express.Router();
const { authenticate, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// FEATURE 6: PARENT LOGIN PORTAL
// ==========================================

// Parent login (using phone number)
router.post('/login', async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      throw new AppError('Phone and password are required', 400);
    }

    const parent = await prisma.parent.findFirst({
      where: {
        OR: [
          { fatherPhone: phone },
          { motherPhone: phone },
          { guardianPhone: phone },
        ],
      },
      include: {
        user: true,
        students: {
          include: {
            student: {
              include: {
                profile: true,
                class: true,
                section: true,
              },
            },
          },
        },
      },
    });

    if (!parent) throw new AppError('Parent not found', 404);

    // If parent has a user account, verify password
    if (parent.user) {
      const isValid = await bcrypt.compare(password, parent.user.password);
      if (!isValid) throw new AppError('Invalid password', 401);
    } else {
      // Auto-create user account for parent
      if (parent.userId) {
        const hashedPassword = await bcrypt.hash(password, 12);
        await prisma.user.update({
          where: { id: parent.userId },
          data: { password: hashedPassword },
        });
      }
    }

    const token = jwt.sign(
      { parentId: parent.id, role: 'PARENT', schoolId: parent.schoolId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        parent: {
          id: parent.id,
          fatherName: parent.fatherName,
          motherName: parent.motherName,
          phone: parent.fatherPhone,
        },
        children: parent.students.map(ps => ({
          id: ps.student.id,
          studentId: ps.student.studentId,
          name: `${ps.student.profile.firstName} ${ps.student.profile.lastName}`,
          class: ps.student.class.name,
          section: ps.student.section.name,
          rollNumber: ps.student.rollNumber,
          photo: ps.student.profile.photoUrl,
        })),
        token,
      },
    });
  } catch (error) { next(error); }
});

// Parent dashboard
router.get('/dashboard/:studentId', authenticate, async (req, res, next) => {
  try {
    const studentId = req.params.studentId;

    // Verify parent has access to this student
    const parentStudent = await prisma.parentStudent.findFirst({
      where: {
        parentId: req.user.parent?.id,
        studentId,
      },
      include: {
        student: {
          include: {
            profile: true,
            class: true,
            section: true,
          },
        },
      },
    });

    if (!parentStudent) throw new AppError('Access denied', 403);

    const student = parentStudent.student;

    // Attendance this month
    const now = new Date();
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: new Date(now.getFullYear(), now.getMonth(), 1),
          lte: new Date(now.getFullYear(), now.getMonth() + 1, 0),
        },
      },
    });

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(2) : 100;

    // Pending fees
    const feePayments = await prisma.feePayment.findMany({
      where: { studentId, status: { in: ['PENDING', 'OVERDUE'] } },
      orderBy: { dueDate: 'asc' },
    });

    // Latest exam results
    const marks = await prisma.mark.findMany({
      where: { studentId },
      include: { exam: true, subject: true },
      orderBy: { exam: { startDate: 'desc' } },
      take: 20,
    });

    // Recent notices
    const notices = await prisma.notice.findMany({
      where: { schoolId: req.schoolId, isActive: true },
      orderBy: { publishDate: 'desc' },
      take: 5,
    });

    // Homework due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const homework = await prisma.homework.findMany({
      where: {
        classId: student.classId,
        dueDate: { gte: today, lt: tomorrow },
      },
      include: { subject: true, submissions: { where: { studentId } } },
    });

    // Timetable for today
    const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1; // Convert to Mon=0
    const timetable = await prisma.timetable.findMany({
      where: { classId: student.classId, sectionId: student.sectionId, dayOfWeek },
      include: { subject: true },
      orderBy: { period: 'asc' },
    });

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          studentId: student.studentId,
          name: `${student.profile.firstName} ${student.profile.lastName}`,
          class: student.class.name,
          section: student.section.name,
          rollNumber: student.rollNumber,
          photo: student.profile.photoUrl,
        },
        attendance: {
          totalDays,
          presentDays,
          absentDays: totalDays - presentDays,
          percentage: attendancePercentage,
          below75: parseFloat(attendancePercentage) < 75,
        },
        pendingFees: feePayments.map(fp => ({
          id: fp.id,
          installment: fp.installmentNumber,
          dueDate: fp.dueDate,
          amount: fp.totalAmount,
          balance: fp.balanceAmount,
          status: fp.status,
        })),
        latestResults: marks.slice(0, 10),
        notices,
        homeworkDueToday: homework,
        todayTimetable: timetable,
      },
    });
  } catch (error) { next(error); }
});

// Parent attendance view
router.get('/attendance/:studentId', authenticate, async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId: req.params.studentId,
        date: {
          gte: startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1),
          lte: endDate ? new Date(endDate) : new Date(),
        },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: attendance });
  } catch (error) { next(error); }
});

// Parent fee view
router.get('/fees/:studentId', authenticate, async (req, res, next) => {
  try {
    const feePayments = await prisma.feePayment.findMany({
      where: { studentId: req.params.studentId },
      orderBy: { createdAt: 'desc' },
    });

    const totalDue = feePayments.reduce((sum, p) => sum + p.totalAmount, 0);
    const totalPaid = feePayments.reduce((sum, p) => sum + p.paidAmount, 0);
    const balance = totalDue - totalPaid;

    res.json({
      success: true,
      data: {
        payments: feePayments,
        summary: { totalDue, totalPaid, balance },
      },
    });
  } catch (error) { next(error); }
});

// Parent results view
router.get('/results/:studentId', authenticate, async (req, res, next) => {
  try {
    const marks = await prisma.mark.findMany({
      where: { studentId: req.params.studentId },
      include: { exam: true, subject: true },
      orderBy: [{ exam: { startDate: 'desc' } }, { subject: { name: 'asc' } }],
    });

    // Group by exam
    const examResults = {};
    marks.forEach(m => {
      if (!examResults[m.examId]) {
        examResults[m.examId] = { exam: m.exam, marks: [] };
      }
      examResults[m.examId].marks.push(m);
    });

    res.json({ success: true, data: Object.values(examResults) });
  } catch (error) { next(error); }
});

module.exports = router;
