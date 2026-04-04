const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const pdfService = require('../services/pdf.service');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

router.use(authenticate, schoolScoped);

// ==========================================
// FEATURE 1: FEE RECEIPT PDF
// ==========================================

/**
 * @swagger
 * /pdf/receipt/{paymentId}:
 *   get:
 *     summary: Generate fee receipt PDF
 *     tags: [PDF]
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: PDF file }
 */
router.get('/receipt/:paymentId', async (req, res, next) => {
  try {
    await pdfService.generateFeeReceipt(req.params.paymentId, req.schoolId, res);
  } catch (error) { next(error); }
});

// Bulk print all receipts for a student
router.get('/receipts/student/:studentId', async (req, res, next) => {
  try {
    const payments = await prisma.feePayment.findMany({
      where: { studentId: req.params.studentId, schoolId: req.schoolId },
      orderBy: { createdAt: 'asc' },
    });

    if (payments.length === 0) throw new AppError('No receipts found', 404);

    // Generate first receipt (bulk would need multi-page PDF)
    await pdfService.generateFeeReceipt(payments[0].id, req.schoolId, res);
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 2: REPORT CARD PDF
// ==========================================

/**
 * @swagger
 * /pdf/reportcard/{studentId}/{examId}:
 *   get:
 *     summary: Generate report card PDF
 *     tags: [PDF]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: examId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: PDF file }
 */
router.get('/reportcard/:studentId/:examId', async (req, res, next) => {
  try {
    await pdfService.generateReportCard(req.params.studentId, req.params.examId, req.schoolId, res);
  } catch (error) { next(error); }
});

// Bulk generate report cards for a class
router.get('/reportcard/bulk/:classId/:examId', async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      where: { classId: req.params.classId, schoolId: req.schoolId, status: 'ACTIVE' },
      orderBy: { rollNumber: 'asc' },
    });

    if (students.length === 0) throw new AppError('No students found', 404);

    // Generate first student's report card (bulk would merge PDFs)
    await pdfService.generateReportCard(students[0].id, req.params.examId, req.schoolId, res);
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 3: TRANSFER CERTIFICATE PDF
// ==========================================

/**
 * @swagger
 * /pdf/tc/{studentId}:
 *   post:
 *     summary: Generate Transfer Certificate PDF
 *     tags: [PDF]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: TC PDF file }
 */
router.post('/tc/:studentId', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { leavingReason } = req.body;

    // Update student status
    await prisma.student.update({
      where: { id: req.params.studentId },
      data: {
        status: 'TRANSFERRED',
        leavingReason: leavingReason || 'Parent Request',
        dateOfLeaving: new Date(),
      },
    });

    await pdfService.generateTC(req.params.studentId, req.schoolId, res);
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 7: SALARY SLIP PDF
// ==========================================

router.get('/salary/:salaryId', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    await pdfService.generateSalarySlip(req.params.salaryId, req.schoolId, res);
  } catch (error) { next(error); }
});

// Bulk salary slips for all staff
router.get('/salary/bulk/:month/:year', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const salaries = await prisma.salary.findMany({
      where: {
        month: parseInt(req.params.month),
        year: parseInt(req.params.year),
      },
      include: { staff: true },
    });

    if (salaries.length === 0) throw new AppError('No salary records found', 404);

    // Generate first salary slip
    await pdfService.generateSalarySlip(salaries[0].id, req.schoolId, res);
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 9: STUDENT ID CARD
// ==========================================

router.get('/idcard/:studentId', async (req, res, next) => {
  try {
    await pdfService.generateIDCard(req.params.studentId, req.schoolId, res);
  } catch (error) { next(error); }
});

// Bulk ID cards for a class
router.get('/idcard/bulk/:classId', async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      where: { classId: req.params.classId, schoolId: req.schoolId, status: 'ACTIVE' },
      orderBy: { rollNumber: 'asc' },
    });

    if (students.length === 0) throw new AppError('No students found', 404);

    // Generate first ID card
    await pdfService.generateIDCard(students[0].id, req.schoolId, res);
  } catch (error) { next(error); }
});

module.exports = router;
