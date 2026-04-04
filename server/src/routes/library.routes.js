const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

router.use(authenticate, schoolScoped);

router.get('/books', async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 20 } = req.query;
    const where = { schoolId: req.schoolId };
    if (search) where.OR = [{ title: { contains: search, mode: 'insensitive' } }, { author: { contains: search, mode: 'insensitive' } }, { isbn: { contains: search } }];
    if (category) where.category = category;
    if (status) where.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [books, total] = await Promise.all([
      prisma.libraryBook.findMany({ where, skip, take: parseInt(limit), orderBy: { title: 'asc' } }),
      prisma.libraryBook.count({ where }),
    ]);
    res.json({ success: true, data: { books, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (error) { next(error); }
});

router.post('/books', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const book = await prisma.libraryBook.create({
      data: { schoolId: req.schoolId, ...req.body },
    });
    res.status(201).json({ success: true, data: book });
  } catch (error) { next(error); }
});

router.post('/issue', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { bookId, studentId, dueDate } = req.body;
    const book = await prisma.libraryBook.findUnique({ where: { id: bookId } });
    if (!book || book.availableCopies <= 0) throw new AppError('Book not available', 400);
    const issue = await prisma.$transaction(async (tx) => {
      await tx.libraryBook.update({ where: { id: bookId }, data: { availableCopies: { decrement: 1 } } });
      return tx.bookIssue.create({
        data: { schoolId: req.schoolId, bookId, studentId, dueDate: new Date(dueDate), issuedBy: req.userId },
        include: { book: true, student: { include: { profile: true } } },
      });
    });
    res.status(201).json({ success: true, data: issue });
  } catch (error) { next(error); }
});

router.post('/return/:id', authorize('TEACHER', 'ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const issue = await prisma.bookIssue.findUnique({ where: { id: req.params.id } });
    if (!issue) throw new AppError('Book issue not found', 404);
    const returnDate = new Date();
    const dueDate = new Date(issue.dueDate);
    let fineAmount = 0;
    if (returnDate > dueDate) {
      const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      fineAmount = daysLate * 5;
    }
    const updated = await prisma.$transaction(async (tx) => {
      await tx.libraryBook.update({ where: { id: issue.bookId }, data: { availableCopies: { increment: 1 } } });
      return tx.bookIssue.update({
        where: { id: req.params.id },
        data: { returnDate, fineAmount, status: fineAmount > 0 ? 'Returned with Fine' : 'Returned' },
      });
    });
    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
});

router.get('/issues', async (req, res, next) => {
  try {
    const { studentId, status } = req.query;
    const where = { schoolId: req.schoolId };
    if (studentId) where.studentId = studentId;
    if (status) where.status = status;
    const issues = await prisma.bookIssue.findMany({
      where, include: { book: true, student: { include: { profile: true } } }, orderBy: { issueDate: 'desc' },
    });
    res.json({ success: true, data: issues });
  } catch (error) { next(error); }
});

module.exports = router;
