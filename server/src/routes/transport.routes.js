const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');

router.use(authenticate, schoolScoped);

router.get('/routes', async (req, res, next) => {
  try {
    const routes = await prisma.transportRoute.findMany({
      where: { schoolId: req.schoolId },
      include: { stops: { orderBy: { stopOrder: 'asc' } }, vehicles: true },
    });
    res.json({ success: true, data: routes });
  } catch (error) { next(error); }
});

router.post('/routes', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const route = await prisma.transportRoute.create({ data: { schoolId: req.schoolId, ...req.body } });
    res.status(201).json({ success: true, data: route });
  } catch (error) { next(error); }
});

router.get('/vehicles', async (req, res, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ where: { schoolId: req.schoolId }, orderBy: { vehicleNumber: 'asc' } });
    res.json({ success: true, data: vehicles });
  } catch (error) { next(error); }
});

router.post('/vehicles', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        schoolId: req.schoolId,
        ...req.body,
        driverLicenseExpiry: req.body.driverLicenseExpiry ? new Date(req.body.driverLicenseExpiry) : null,
        fitnessExpiry: req.body.fitnessExpiry ? new Date(req.body.fitnessExpiry) : null,
        insuranceExpiry: req.body.insuranceExpiry ? new Date(req.body.insuranceExpiry) : null,
      },
    });
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) { next(error); }
});

module.exports = router;
