const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { AppError } = require('../utils/appError');
const { validate } = require('../middleware/validate');
const staffValidation = require('../validations/staff.validation');
const { logAction, Actions, Resources } = require('../utils/auditLogger');

router.use(authenticate, schoolScoped);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), validate(staffValidation.createStaff), async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email, designation, department, qualification,
            dateOfJoining, basicPay, specialization, experience, employmentType } = req.body;

    const staffCount = await prisma.staff.count({ where: { schoolId: req.schoolId } });
    const staffId = `STF${new Date().getFullYear().toString().slice(-2)}${(staffCount + 1).toString().padStart(4, '0')}`;
    const employeeCode = `EMP${Date.now().toString().slice(-6)}`;

    const defaultPassword = await bcrypt.hash('admin123', 12);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          schoolId: req.schoolId,
          phone: phone || '0000000000',
          email: email || null,
          password: defaultPassword,
          role: 'TEACHER',
        },
      });

      // Create profile for the user
      if (firstName) {
        await tx.profile.create({
          data: {
            userId: newUser.id,
            firstName: firstName || 'Staff',
            lastName: lastName || '',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'Other',
          },
        });
      }

      const staff = await tx.staff.create({
        data: {
          userId: newUser.id,
          schoolId: req.schoolId,
          staffId,
          employeeCode,
          designation: designation || 'Teacher',
          department: department || 'General',
          qualification: qualification || 'B.Ed',
          dateOfJoining: dateOfJoining ? new Date(dateOfJoining) : new Date(),
          basicPay: parseFloat(basicPay) || 0,
          specialization: specialization || null,
          experience: parseInt(experience) || 0,
          employmentType: employmentType || 'Permanent',
        },
      });

      return tx.staff.findUnique({
        where: { id: staff.id },
        include: { user: { include: { profile: true } } },
      });
    });

    await logAction({
      schoolId: req.schoolId,
      userId: req.userId,
      action: Actions.CREATE,
      resource: Resources.STAFF,
      resourceId: result.id,
      newValue: result,
      req,
    });
    res.status(201).json({ success: true, data: result });
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
      prisma.staff.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { user: { include: { profile: true } } },
        orderBy: { dateOfJoining: 'desc' }
      }),
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

router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), validate(staffValidation.updateStaff), async (req, res, next) => {
  try {
    // Security Fix: Guard update with schoolId check
    const existing = await prisma.staff.findFirst({
      where: { id: req.params.id, schoolId: req.schoolId }
    });
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff record not found or unauthorized.' });
    }

    const staff = await prisma.staff.update({
      where: { id: req.params.id },
      data: req.body,
    });
    await logAction({
      schoolId: req.schoolId,
      userId: req.userId,
      action: Actions.UPDATE,
      resource: Resources.STAFF,
      resourceId: req.params.id,
      oldValue: existing,
      newValue: staff,
      req,
    });
    res.json({ success: true, data: staff });
  } catch (error) { next(error); }
});

router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const existing = await prisma.staff.findFirst({
      where: { id: req.params.id, schoolId: req.schoolId }
    });
    
    if (!existing) {
      throw new AppError('Staff not found', 404);
    }

    await prisma.staff.update({
      where: { id: req.params.id },
      data: { status: 'Inactive' }
    });

    await logAction({
      schoolId: req.schoolId,
      userId: req.userId,
      action: Actions.DELETE,
      resource: Resources.STAFF,
      resourceId: req.params.id,
      oldValue: existing,
      newValue: { status: 'Inactive' },
      req,
    });

    res.json({ success: true, message: 'Staff deactivated successfully' });
  } catch (error) { next(error); }
});

module.exports = router;
