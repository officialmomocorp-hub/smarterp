const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const examService = require('../services/exam.service');
const examEnhanced = require('../services/examEnhanced.service');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

router.use(authenticate, schoolScoped);

// ==========================================
// EXISTING EXAM ROUTES
// ==========================================

router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.body, req.schoolId);
    res.status(201).json({ success: true, data: exam });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const { classId, academicYearId, type } = req.query;
    const where = { schoolId: req.schoolId };
    if (classId) where.classId = classId;
    if (academicYearId) where.academicYearId = academicYearId;
    if (type) where.type = type;
    const exams = await prisma.exam.findMany({ where, include: { class: true }, orderBy: { startDate: 'desc' } });
    res.json({ success: true, data: exams });
  } catch (error) { next(error); }
});

router.post('/marks', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const mark = await examService.enterMarks(req.body, req.userId);
    res.status(201).json({ success: true, data: mark });
  } catch (error) { next(error); }
});

router.post('/marks/bulk', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const marks = await examService.bulkEnterMarks(req.body, req.userId);
    res.status(201).json({ success: true, data: marks });
  } catch (error) { next(error); }
});

router.get('/result/student/:studentId', async (req, res, next) => {
  try {
    const { examId } = req.query;
    const result = await examService.getStudentResult(req.params.studentId, examId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/merit-list', async (req, res, next) => {
  try {
    const { examId, classId } = req.query;
    const meritList = await examService.generateMeritList(examId, classId);
    res.json({ success: true, data: meritList });
  } catch (error) { next(error); }
});

router.get('/failed-students', async (req, res, next) => {
  try {
    const { examId, classId } = req.query;
    const failed = await examService.getFailedStudentList(examId, classId);
    res.json({ success: true, data: failed });
  } catch (error) { next(error); }
});

router.post('/:id/publish', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const result = await examService.publishResults(req.params.id);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// ==========================================
// ENHANCED EXAM ROUTES
// ==========================================

// --- Verification Workflow ---
router.post('/marks/:id/submit', authorize('TEACHER'), async (req, res, next) => {
  try {
    const mark = await examEnhanced.submitMarksForVerification(req.params.id, req.userId);
    res.json({ success: true, data: mark });
  } catch (error) { next(error); }
});

router.put('/marks/:id/hod-verify', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { action, remarks } = req.body;
    const mark = await examEnhanced.hodVerifyMark(req.params.id, req.userId, action, remarks);
    res.json({ success: true, data: mark });
  } catch (error) { next(error); }
});

router.put('/marks/:id/principal-approve', authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { action, remarks } = req.body;
    const mark = await examEnhanced.principalApproveMark(req.params.id, req.userId, action, remarks);
    res.json({ success: true, data: mark });
  } catch (error) { next(error); }
});

router.get('/verification/pending', async (req, res, next) => {
  try {
    const marks = await examEnhanced.getPendingVerifications(req.schoolId, req.userRole, req.userId);
    res.json({ success: true, data: marks });
  } catch (error) { next(error); }
});

// --- Excel Bulk Upload ---
router.get('/marks/template/:examId', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const template = await examEnhanced.generateMarksTemplate(req.params.examId);
    res.json({ success: true, data: template });
  } catch (error) { next(error); }
});

router.post('/marks/bulk-upload', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { examId, marksData } = req.body;
    const results = await examEnhanced.bulkUploadMarks(examId, marksData, req.userId);
    res.json({ success: true, data: results });
  } catch (error) { next(error); }
});

// --- Enhanced Grade Calculation ---
router.get('/result/cbse/:studentId', async (req, res, next) => {
  try {
    const { examId } = req.query;
    const result = await examEnhanced.calculateCBSEResult(req.params.studentId, examId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/result/cce/:studentId', async (req, res, next) => {
  try {
    const { examId } = req.query;
    const result = await examEnhanced.calculateCCEResult(req.params.studentId, examId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/result/state-board/:studentId', async (req, res, next) => {
  try {
    const { examId } = req.query;
    const result = await examEnhanced.calculateStateBoardResult(req.params.studentId, examId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// --- Hall Ticket ---
router.get('/hall-ticket/:studentId/:examId', async (req, res, next) => {
  try {
    const ticket = await examEnhanced.generateHallTicket(req.params.studentId, req.params.examId, req.schoolId);
    res.json({ success: true, data: ticket });
  } catch (error) { next(error); }
});

router.get('/hall-tickets/bulk/:examId/:classId', async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      where: { classId: req.params.classId, status: 'ACTIVE' },
      include: { profile: true, section: true },
    });

    const tickets = [];
    for (const student of students) {
      try {
        const ticket = await examEnhanced.generateHallTicket(student.id, req.params.examId, req.schoolId);
        tickets.push(ticket);
      } catch (e) {
        // Skip students without complete data
      }
    }

    res.json({ success: true, data: tickets, count: tickets.length });
  } catch (error) { next(error); }
});

// --- Seating Arrangement ---
router.post('/seating/generate', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { examId, classId } = req.body;
    const result = await examEnhanced.generateSeatingArrangement(examId, classId, req.schoolId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.get('/seating/:examId/:roomId', async (req, res, next) => {
  try {
    const seating = await prisma.seatingArrangement.findMany({
      where: { examId: req.params.examId, roomId: req.params.roomId },
      include: {
        student: { include: { profile: true, section: true } },
        room: true,
      },
      orderBy: [{ rowNumber: 'asc' }, { seatNumber: 'asc' }],
    });
    res.json({ success: true, data: seating });
  } catch (error) { next(error); }
});

// --- Exam Rooms ---
router.get('/rooms', async (req, res, next) => {
  try {
    const rooms = await prisma.examRoom.findMany({
      where: { schoolId: req.schoolId },
      orderBy: { roomNumber: 'asc' },
    });
    res.json({ success: true, data: rooms });
  } catch (error) { next(error); }
});

router.post('/rooms', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const room = await prisma.examRoom.create({
      data: { schoolId: req.schoolId, ...req.body },
    });
    res.status(201).json({ success: true, data: room });
  } catch (error) { next(error); }
});

// --- Invigilator Duty ---
router.post('/invigilator', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const duty = await prisma.invigilatorDuty.create({
      data: { ...req.body, date: new Date(req.body.date) },
    });
    res.status(201).json({ success: true, data: duty });
  } catch (error) { next(error); }
});

router.get('/invigilator/:teacherId', async (req, res, next) => {
  try {
    const duties = await prisma.invigilatorDuty.findMany({
      where: { examId: req.query.examId, teacherId: req.params.teacherId },
      include: { exam: true, room: true },
    });
    res.json({ success: true, data: duties });
  } catch (error) { next(error); }
});

// --- Answer Book Tracking ---
router.post('/answer-books/generate', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { examId, count } = req.body;
    const books = [];
    for (let i = 0; i < count; i++) {
      const barcode = `AB${Date.now().toString(36).toUpperCase()}${i.toString().padStart(4, '0')}`;
      const book = await prisma.answerBook.create({
        data: { schoolId: req.schoolId, barcode, examId: examId || null, status: 'UNUSED' },
      });
      books.push(book);
    }
    res.status(201).json({ success: true, data: books, count: books.length });
  } catch (error) { next(error); }
});

router.post('/answer-books/assign', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const { barcode, studentId, subjectId } = req.body;
    const book = await prisma.answerBook.update({
      where: { barcode },
      data: {
        studentId,
        subjectId,
        status: 'DISTRIBUTED',
        distributedAt: new Date(),
      },
    });
    res.json({ success: true, data: book });
  } catch (error) { next(error); }
});

router.post('/answer-books/collect', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const { barcode } = req.body;
    const book = await prisma.answerBook.update({
      where: { barcode },
      data: { status: 'COLLECTED', collectedAt: new Date() },
    });
    res.json({ success: true, data: book });
  } catch (error) { next(error); }
});

router.post('/answer-books/check', authorize('TEACHER'), async (req, res, next) => {
  try {
    const { barcode, checkedBy } = req.body;
    const book = await prisma.answerBook.update({
      where: { barcode },
      data: { status: 'CHECKED', checkedBy, checkedAt: new Date(), marksEntered: true },
    });
    res.json({ success: true, data: book });
  } catch (error) { next(error); }
});

router.post('/answer-books/return', authorize('TEACHER', 'ADMIN'), async (req, res, next) => {
  try {
    const { barcode } = req.body;
    const book = await prisma.answerBook.update({
      where: { barcode },
      data: { status: 'RETURNED', returnedToOffice: true },
    });
    res.json({ success: true, data: book });
  } catch (error) { next(error); }
});

// --- Compartment Exam ---
router.get('/compartment/eligible/:examId/:classId', async (req, res, next) => {
  try {
    const eligible = await examEnhanced.identifyCompartmentEligible(req.params.examId, req.params.classId);
    res.json({ success: true, data: eligible });
  } catch (error) { next(error); }
});

router.post('/compartment', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const compartment = await examEnhanced.createCompartmentExam(req.body, req.schoolId);
    res.status(201).json({ success: true, data: compartment });
  } catch (error) { next(error); }
});

// --- Enhanced Merit List ---
router.get('/merit-list/enhanced/:examId/:classId', async (req, res, next) => {
  try {
    const result = await examEnhanced.generateEnhancedMeritList(req.params.examId, req.params.classId);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

// --- Result Analytics ---
router.get('/analytics/:examId/:classId', async (req, res, next) => {
  try {
    const analytics = await examEnhanced.getExamAnalytics(req.params.examId, req.params.classId);
    res.json({ success: true, data: analytics });
  } catch (error) { next(error); }
});

// --- AI Smart Remarks ---
router.post('/smart-remarks', async (req, res, next) => {
  try {
    const { marks, attendance, studentName } = req.body;
    const remarks = await examEnhanced.generateSmartRemarks(marks, attendance, studentName);
    res.json({ success: true, data: remarks });
  } catch (error) { next(error); }
});

// --- Recheck Application ---
router.post('/recheck/apply', async (req, res, next) => {
  try {
    const application = await examEnhanced.applyForRecheck(req.body, req.schoolId);
    res.status(201).json({ success: true, data: application });
  } catch (error) { next(error); }
});

router.get('/recheck', async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = { schoolId: req.schoolId };
    if (status) where.status = status;
    if (req.userRole === 'STUDENT' || req.userRole === 'PARENT') {
      where.studentId = req.user.student?.id;
    }
    const applications = await prisma.recheckApplication.findMany({
      where,
      include: { student: { include: { profile: true } }, exam: true },
      orderBy: { appliedAt: 'desc' },
    });
    res.json({ success: true, data: applications });
  } catch (error) { next(error); }
});

// --- Health Records ---
router.post('/health-record', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const record = await prisma.studentHealthRecord.upsert({
      where: {
        studentId_academicYear: {
          studentId: req.body.studentId,
          academicYear: req.body.academicYear,
        },
      },
      update: req.body,
      create: req.body,
    });
    res.json({ success: true, data: record });
  } catch (error) { next(error); }
});

router.get('/health-record/:studentId', async (req, res, next) => {
  try {
    const records = await prisma.studentHealthRecord.findMany({
      where: { studentId: req.params.studentId },
      orderBy: { recordedAt: 'desc' },
    });
    res.json({ success: true, data: records });
  } catch (error) { next(error); }
});

module.exports = router;
