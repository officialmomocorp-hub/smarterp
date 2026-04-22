const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');
const XLSX = require('xlsx');

router.use(authenticate, schoolScoped);

// ==========================================
// FEATURE 11: INCOME & EXPENSE LEDGER
// ==========================================

// Add ledger entry
router.post('/ledger', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { type, category, amount, date, description, reference, paymentMode } = req.body;
    const entry = await prisma.ledgerEntry.create({
      data: {
        schoolId: req.schoolId,
        type, category, amount: parseFloat(amount),
        date: new Date(date), description, reference, paymentMode,
        createdBy: req.userId,
      },
    });
    res.status(201).json({ success: true, data: entry });
  } catch (error) { next(error); }
});

// Get ledger entries
router.get('/ledger', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, page = 1, limit = 20 } = req.query;
    const where = { schoolId: req.schoolId };
    if (type) where.type = type;
    if (category) where.category = category;
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [entries, total] = await Promise.all([
      prisma.ledgerEntry.findMany({ where, skip, take: parseInt(limit), orderBy: { date: 'desc' } }),
      prisma.ledgerEntry.count({ where }),
    ]);

    const [totalIncome, totalExpense] = await Promise.all([
      prisma.ledgerEntry.aggregate({ where: { ...where, type: 'INCOME' }, _sum: { amount: true } }),
      prisma.ledgerEntry.aggregate({ where: { ...where, type: 'EXPENSE' }, _sum: { amount: true } }),
    ]);

    res.json({
      success: true,
      data: {
        entries,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
        summary: {
          totalIncome: totalIncome._sum.amount || 0,
          totalExpense: totalExpense._sum.amount || 0,
          netBalance: (totalIncome._sum.amount || 0) - (totalExpense._sum.amount || 0),
        },
      },
    });
  } catch (error) { next(error); }
});

// Export ledger to Excel
router.get('/ledger/export', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const where = { schoolId: req.schoolId };
    if (startDate && endDate) {
      where.date = { gte: new Date(startDate), lte: new Date(endDate) };
    }
    const entries = await prisma.ledgerEntry.findMany({ where, orderBy: { date: 'asc' } });

    const rows = [['Date', 'Type', 'Category', 'Amount', 'Description', 'Reference', 'Payment Mode']];
    entries.forEach(e => {
      rows.push([
        e.date.toISOString().split('T')[0],
        e.type,
        e.category,
        e.amount,
        e.description || '',
        e.reference || '',
        e.paymentMode || '',
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'Ledger');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="ledger.xlsx"');
    res.send(buffer);
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 12: RTE 25% QUOTA MANAGEMENT
// ==========================================

// Get RTE quota for all classes
router.get('/rte/quota', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { academicYearId } = req.query;
    const quotas = await prisma.rTEQuota.findMany({
      where: { schoolId: req.schoolId, academicYearId },
    });
    res.json({ success: true, data: quotas });
  } catch (error) { next(error); }
});

// Set RTE quota for a class
router.post('/rte/quota', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { classId, academicYearId, totalSeats } = req.body;
    const rteSeats = Math.ceil(totalSeats * 0.25);
    const quota = await prisma.rTEQuota.upsert({
      where: { schoolId_academicYearId_classId: { schoolId: req.schoolId, academicYearId, classId } },
      update: { totalSeats, rteSeats },
      create: { schoolId: req.schoolId, classId, academicYearId, totalSeats, rteSeats },
    });
    res.json({ success: true, data: quota });
  } catch (error) { next(error); }
});

// Get RTE eligible students
router.get('/rte/students', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { academicYearId } = req.query;
    const students = await prisma.student.findMany({
      where: { schoolId: req.schoolId, academicYearId, rteSeat: true, status: 'ACTIVE' },
      include: { profile: true, class: true, section: true },
    });
    res.json({ success: true, data: students });
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 13: SYLLABUS & LESSON PLAN
// ==========================================

// Get syllabus for class/subject
router.get('/syllabus', async (req, res, next) => {
  try {
    const { classId, subjectId } = req.query;
    const where = { schoolId: req.schoolId };
    if (classId) where.classId = classId;
    if (subjectId) where.subjectId = subjectId;
    const syllabus = await prisma.syllabus.findMany({
      where,
      orderBy: { chapterNumber: 'asc' },
    });
    res.json({ success: true, data: syllabus });
  } catch (error) { next(error); }
});

// Add/update syllabus chapter
router.post('/syllabus', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { classId, subjectId, chapterName, chapterNumber, description } = req.body;
    const chapter = await prisma.syllabus.upsert({
      where: {
        schoolId_classId_subjectId_chapterNumber: {
          schoolId: req.schoolId, classId, subjectId, chapterNumber,
        },
      },
      update: { chapterName, description },
      create: { schoolId: req.schoolId, classId, subjectId, chapterName, chapterNumber, description },
    });
    res.json({ success: true, data: chapter });
  } catch (error) { next(error); }
});

// Mark chapter as completed
router.put('/syllabus/:id/complete', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const chapter = await prisma.syllabus.update({
      where: { id: req.params.id },
      data: { isCompleted: true, completedAt: new Date() },
    });
    res.json({ success: true, data: chapter });
  } catch (error) { next(error); }
});

// Get syllabus coverage percentage
router.get('/syllabus/coverage/:classId', async (req, res, next) => {
  try {
    const syllabus = await prisma.syllabus.findMany({
      where: { schoolId: req.schoolId, classId: req.params.classId },
    });
    const total = syllabus.length;
    const completed = syllabus.filter(s => s.isCompleted).length;
    const percentage = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
    res.json({ success: true, data: { total, completed, percentage } });
  } catch (error) { next(error); }
});

// Lesson Plan
router.post('/lesson-plan', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const plan = await prisma.lessonPlan.create({
      data: {
        schoolId: req.schoolId,
        teacherId: req.userId,
        ...req.body,
        date: new Date(req.body.date),
      },
    });
    res.status(201).json({ success: true, data: plan });
  } catch (error) { next(error); }
});

router.get('/lesson-plan', async (req, res, next) => {
  try {
    const { teacherId, date } = req.query;
    const where = { schoolId: req.schoolId };
    if (teacherId) where.teacherId = teacherId;
    if (date) {
      const d = new Date(date);
      const nextD = new Date(d);
      nextD.setDate(nextD.getDate() + 1);
      where.date = { gte: d, lt: nextD };
    }
    const plans = await prisma.lessonPlan.findMany({ where, orderBy: { date: 'asc' } });
    res.json({ success: true, data: plans });
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 14: ONLINE FEE PAYMENT (RAZORPAY)
// ==========================================

router.post('/razorpay/order', async (req, res, next) => {
  try {
    const { feePaymentId, amount } = req.body;

    // In production, use Razorpay SDK:
    // const Razorpay = require('razorpay');
    // const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: feePaymentId });

    // For now, return mock order
    const order = {
      id: `order_demo_${Date.now()}`,
      amount: amount * 100,
      currency: 'INR',
      receipt: feePaymentId,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo',
    };

    res.json({ success: true, data: order });
  } catch (error) { next(error); }
});

router.post('/razorpay/verify', async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, feePaymentId } = req.body;

    // In production, verify signature:
    // const crypto = require('crypto');
    // const body = razorpay_order_id + '|' + razorpay_payment_id;
    // const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(body).digest('hex');
    // if (expected !== razorpay_signature) throw new AppError('Invalid signature', 400);

    // Update payment status
    await prisma.feePayment.update({
      where: { id: feePaymentId },
      data: {
        status: 'PAID',
        paymentDate: new Date(),
        paymentMode: 'RAZORPAY',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        balanceAmount: 0,
      },
    });

    res.json({ success: true, data: { verified: true, paymentId: razorpay_payment_id } });
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 15: WHATSAPP NOTIFICATIONS
// ==========================================

router.post('/whatsapp/send', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const { recipientIds, messageType, template, variables } = req.body;

    // In production, use WATI/AiSensy API:
    // const response = await axios.post('https://wati.io/api/v1/sendMessage', {
    //   phoneNumbers: recipientIds,
    //   template_name: template,
    //   parameters: variables,
    // }, { headers: { Authorization: `Bearer ${process.env.WHATSAPP_API_KEY}` } });

    const message = await prisma.whatsAppMessage.create({
      data: {
        schoolId: req.schoolId,
        recipientIds: Array.isArray(recipientIds) ? recipientIds.join(',') : recipientIds,
        messageType, template, variables: JSON.stringify(variables || {}),
        status: 'Sent',
        sentAt: new Date(),
      },
    });

    res.json({ success: true, data: message });
  } catch (error) { next(error); }
});

router.get('/whatsapp', async (req, res, next) => {
  try {
    const { messageType, status } = req.query;
    const where = { schoolId: req.schoolId };
    if (messageType) where.messageType = messageType;
    if (status) where.status = status;
    const messages = await prisma.whatsAppMessage.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 50,
    });
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 16: MERIT LIST & RANK
// ==========================================

router.get('/merit/:examId/:classId', async (req, res, next) => {
  try {
    const marks = await prisma.mark.findMany({
      where: { examId: req.params.examId },
      include: { student: { include: { profile: true, class: true, section: true } }, subject: true },
    });

    // Filter by class
    const classMarks = marks.filter(m => m.student.classId === req.params.classId);

    // Calculate per-student totals
    const studentTotals = {};
    classMarks.forEach(m => {
      if (!studentTotals[m.studentId]) {
        studentTotals[m.studentId] = {
          student: m.student,
          totalObtained: 0,
          totalMax: 0,
          subjects: [],
        };
      }
      studentTotals[m.studentId].totalObtained += m.marksObtained || 0;
      studentTotals[m.studentId].totalMax += m.maxMarks;
      studentTotals[m.studentId].subjects.push({
        name: m.subject.name,
        marks: m.marksObtained,
        max: m.maxMarks,
        grade: m.grade,
      });
    });

    // Rank
    const meritList = Object.values(studentTotals)
      .map(s => ({ ...s, percentage: ((s.totalObtained / s.totalMax) * 100).toFixed(2) }))
      .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
      .map((s, i) => ({ ...s, rank: i + 1 }));

    // Subject toppers
    const subjectToppers = {};
    classMarks.forEach(m => {
      if (!subjectToppers[m.subjectId] || m.marksObtained > subjectToppers[m.subjectId].marksObtained) {
        subjectToppers[m.subjectId] = {
          studentName: `${m.student.profile.firstName} ${m.student.profile.lastName}`,
          subject: m.subject.name,
          marksObtained: m.marksObtained,
          maxMarks: m.maxMarks,
        };
      }
    });

    // Statistics
    const percentages = meritList.map(s => parseFloat(s.percentage));
    const stats = {
      totalStudents: meritList.length,
      highest: Math.max(...percentages),
      lowest: Math.min(...percentages),
      average: (percentages.reduce((a, b) => a + b, 0) / percentages.length).toFixed(2),
      passPercentage: ((meritList.filter(s => parseFloat(s.percentage) >= 33).length / meritList.length) * 100).toFixed(1),
    };

    res.json({ success: true, data: { meritList, subjectToppers, stats } });
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 17: CHARACTER CERTIFICATE
// ==========================================

router.post('/character-certificate/:studentId', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { fromYear, toYear, classStudied, character } = req.body;
    const certNumber = `CC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    const cert = await prisma.characterCertificate.create({
      data: {
        schoolId: req.schoolId,
        studentId: req.params.studentId,
        certificateNumber: certNumber,
        fromYear, toYear, classStudied,
        character: character || 'Good',
      },
    });

    res.json({ success: true, data: cert });
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 18: SIBLING DISCOUNT
// ==========================================

router.post('/sibling/link', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { primaryStudentId, siblingStudentId, discountPercentage } = req.body;

    const link = await prisma.siblingLink.create({
      data: {
        schoolId: req.schoolId,
        primaryStudentId,
        siblingStudentId,
        discountPercentage: discountPercentage || 10,
      },
    });

    res.status(201).json({ success: true, data: link });
  } catch (error) { next(error); }
});

router.get('/sibling/links', async (req, res, next) => {
  try {
    const links = await prisma.siblingLink.findMany({
      where: { schoolId: req.schoolId },
    });
    res.json({ success: true, data: links });
  } catch (error) { next(error); }
});

router.delete('/sibling/link/:id', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    await prisma.siblingLink.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Sibling link removed' });
  } catch (error) { next(error); }
});

module.exports = router;
