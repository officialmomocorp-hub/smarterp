const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');

router.use(authenticate, schoolScoped);

router.get('/', async (req, res, next) => {
  try {
    const { target, priority } = req.query;
    const where = { schoolId: req.schoolId, isActive: true };
    if (target) where.target = target;
    if (priority) where.priority = priority;
    const notices = await prisma.notice.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { publishDate: 'desc' }],
    });
    res.json({ success: true, data: notices });
  } catch (error) { next(error); }
});

router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const notice = await prisma.notice.create({
      data: {
        schoolId: req.schoolId,
        ...req.body,
        publishDate: new Date(),
        createdBy: req.userId,
      },
    });
    res.status(201).json({ success: true, data: notice });
  } catch (error) { next(error); }
});

router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const notice = await prisma.notice.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: notice });
  } catch (error) { next(error); }
});

module.exports = router;
