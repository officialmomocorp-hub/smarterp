const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');

router.use(authenticate, schoolScoped);

router.get('/', async (req, res, next) => {
  try {
    const { classId, sectionId } = req.query;
    const where = { schoolId: req.schoolId };
    if (classId) where.classId = classId;
    if (sectionId) where.sectionId = sectionId;
    const timetable = await prisma.timetable.findMany({
      where,
      include: { class: true, section: true },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
    });
    res.json({ success: true, data: timetable });
  } catch (error) { next(error); }
});

router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (!data.teacherId && data.staffId) {
      data.teacherId = data.staffId;
      delete data.staffId;
    }

    const entry = await prisma.timetable.create({
      data: { schoolId: req.schoolId, ...data },
    });
    res.status(201).json({ success: true, data: entry });
  } catch (error) { next(error); }
});

router.get('/teacher/:teacherId', async (req, res, next) => {
  try {
    const timetable = await prisma.timetable.findMany({
      where: { schoolId: req.schoolId, teacherId: req.params.teacherId },
      include: { class: true, section: true, subject: true },
      orderBy: [{ dayOfWeek: 'asc' }, { period: 'asc' }],
    });
    res.json({ success: true, data: timetable });
  } catch (error) { next(error); }
});

router.get('/free-periods', async (req, res, next) => {
  try {
    const { dayOfWeek, period } = req.query;
    const teachers = await prisma.staff.findMany({
      where: { schoolId: req.schoolId, status: 'Active' },
      include: { user: true },
    });

    const busyTeachers = await prisma.timetable.findMany({
      where: { schoolId: req.schoolId, dayOfWeek: parseInt(dayOfWeek), period: parseInt(period) },
      select: { teacherId: true },
    });

    const busyIds = busyTeachers.map(t => t.teacherId);
    const freeTeachers = teachers.filter(t => !busyIds.includes(t.userId));

    res.json({ success: true, data: freeTeachers });
  } catch (error) { next(error); }
});

module.exports = router;
