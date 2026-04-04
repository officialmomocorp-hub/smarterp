const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

router.use(authenticate, schoolScoped);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const staffCount = await prisma.staff.count({ where: { schoolId: req.schoolId } });
    const staffId = `STF${new Date().getFullYear().toString().slice(-2)}${(staffCount + 1).toString().padStart(4, '0')}`;
    const employeeCode = `EMP${Date.now().toString().slice(-6)}`;

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          schoolId: req.schoolId,
          phone: req.body.phone,
          email: req.body.email || null,
          password: '',
          role: 'TEACHER',
        },
      });

      const staff = await tx.staff.create({
        data: {
          userId: newUser.id,
          schoolId: req.schoolId,
          staffId,
          employeeCode,
          ...req.body,
          dateOfJoining: new Date(req.body.dateOfJoining),
        },
      });

      return tx.staff.findUnique({
        where: { id: staff.id },
        include: { user: true },
      });
    });

    res.status(201).json({ success: true, data: user });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const { designation, department, status, page = 1, limit = 20 } = req.query;
    const where = { schoolId: req.schoolId };
    if (designation) where.designation = designation;
    if (department) where.department = department;
    if (status) where.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [staff, total] = await Promise.all([
      prisma.staff.findMany({ where, skip, take: parseInt(limit), include: { user: true }, orderBy: { dateOfJoining: 'desc' } }),
      prisma.staff.count({ where }),
    ]);
    res.json({ success: true, data: { staff, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const staff = await prisma.staff.findFirst({
      where: { id: req.params.id, schoolId: req.schoolId },
      include: { user: true, attendance: { take: 30, orderBy: { date: 'desc' } }, salaries: { take: 12, orderBy: { year: 'desc' } } },
    });
    if (!staff) throw new AppError('Staff not found', 404);
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
});

router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const staff = await prisma.staff.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
});

module.exports = router;
