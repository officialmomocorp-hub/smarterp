const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');

router.use(authenticate, schoolScoped);

router.post('/', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const communication = await prisma.communication.create({
      data: {
        schoolId: req.schoolId,
        ...req.body,
        sentBy: req.userId,
      },
    });
    res.status(201).json({ success: true, data: communication });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const where = { schoolId: req.schoolId };
    if (type) where.type = type;
    if (status) where.status = status;
    const communications = await prisma.communication.findMany({
      where, include: { sender: true }, orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: communications });
  } catch (error) { next(error); }
});

module.exports = router;
