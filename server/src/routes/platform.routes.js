const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prisma = require('../config/database');

router.use(authenticate, authorize('SUPER_ADMIN'));

// 1. School Registration Report
router.get('/reports/school-list', async (req, res, next) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        _count: {
          select: { students: true, staff: true, users: true }
        }
      }
    });
    res.json({ success: true, data: schools });
  } catch (error) { next(error); }
});

// 2. Revenue Report
router.get('/reports/revenue', async (req, res, next) => {
  try {
    const rev = await prisma.feePayment.aggregate({
      where: { status: 'PAID' },
      _sum: { paidAmount: true }
    });
    res.json({ 
      success: true, 
      data: {
        totalRevenue: rev._sum.paidAmount || 0,
        currency: 'INR',
        period: 'All Time'
      }
    });
  } catch (error) { next(error); }
});

// 3. Usage Analytics
router.get('/reports/usage', async (req, res, next) => {
  try {
    const stats = await Promise.all([
      prisma.school.count(),
      prisma.student.count(),
      prisma.staff.count(),
      prisma.user.count()
    ]);
    res.json({
      success: true,
      data: {
        schools: stats[0],
        students: stats[1],
        staff: stats[2],
        totalUsers: stats[3]
      }
    });
  } catch (error) { next(error); }
});

// 4. Platform Settings
router.get('/settings', async (req, res, next) => {
  try {
    let settings = await prisma.globalSetting.findUnique({
      where: { id: 'default' }
    });
    
    if (!settings) {
      settings = await prisma.globalSetting.create({
        data: { id: 'default' }
      });
    }
    
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
});

router.patch('/settings', async (req, res, next) => {
  try {
    const settings = await prisma.globalSetting.upsert({
      where: { id: 'default' },
      update: req.body,
      create: { ...req.body, id: 'default' }
    });
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
});

module.exports = router;
