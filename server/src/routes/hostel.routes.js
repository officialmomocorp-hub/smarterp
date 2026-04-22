const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');

router.use(authenticate, schoolScoped);

router.get('/hostels', async (req, res, next) => {
  try {
    const hostels = await prisma.hostel.findMany({
      where: { schoolId: req.schoolId },
      include: { rooms: { include: { allotments: { include: { student: { include: { profile: true } } } } } } },
    });
    res.json({ success: true, data: hostels });
  } catch (error) { next(error); }
});

router.post('/hostels', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const hostel = await prisma.hostel.create({ data: { schoolId: req.schoolId, ...req.body } });
    res.status(201).json({ success: true, data: hostel });
  } catch (error) { next(error); }
});

router.post('/rooms', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const room = await prisma.hostelRoom.create({ data: { ...req.body } });
    res.status(201).json({ success: true, data: room });
  } catch (error) { next(error); }
});

router.post('/allot', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { studentId, roomId, monthlyFee, messFee } = req.body;
    const allotment = await prisma.hostelAllotment.create({
      data: { studentId, roomId, monthlyFee, messFee },
      include: { student: { include: { profile: true } }, room: true },
    });
    await prisma.hostelRoom.update({
      where: { id: roomId },
      data: { occupied: { increment: 1 } },
    });
    res.status(201).json({ success: true, data: allotment });
  } catch (error) { next(error); }
});

module.exports = router;
