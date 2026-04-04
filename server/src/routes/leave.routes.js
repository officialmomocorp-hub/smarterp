const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const leaveService = require('../services/leave.service');
const prisma = require('../config/database');

router.use(authenticate, schoolScoped);

router.post('/', async (req, res, next) => {
  try {
    const leave = await leaveService.createLeave(req.body, req.schoolId, req.userId);
    res.status(201).json({ success: true, data: leave });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const result = await leaveService.getLeaves(req.schoolId, req.query);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

router.put('/:id/approve', authorize('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const leave = await leaveService.approveLeave(req.params.id, req.userId, status, rejectionReason);
    res.json({ success: true, data: leave });
  } catch (error) { next(error); }
});

router.get('/balance/:staffId', async (req, res, next) => {
  try {
    const { year } = req.query;
    const balance = await leaveService.getLeaveBalance(req.params.staffId, parseInt(year) || new Date().getFullYear());
    res.json({ success: true, data: balance });
  } catch (error) { next(error); }
});

module.exports = router;
