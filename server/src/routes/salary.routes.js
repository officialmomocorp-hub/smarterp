const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

router.use(authenticate, schoolScoped);

router.post('/calculate', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { staffId, month, year } = req.body;
    const staff = await prisma.staff.findFirst({
      where: { id: staffId, schoolId: req.schoolId },
    });
    if (!staff) throw new AppError('Staff not found', 404);

    const basicPay = parseFloat(staff.basicPay);
    const da = basicPay * 0.17;
    const hra = basicPay * 0.08;
    const ta = 1000;
    const grossSalary = basicPay + da + hra + ta;

    const pfEmployee = basicPay * 0.12;
    const pfEmployer = basicPay * 0.12;
    const esi = grossSalary <= 21000 ? grossSalary * 0.0075 : 0;
    const professionalTax = 200;
    const incomeTax = grossSalary > 500000 ? (grossSalary - 500000) * 0.05 / 12 : 0;
    const totalDeductions = pfEmployee + esi + professionalTax + incomeTax;
    const netSalary = grossSalary - totalDeductions;

    res.json({
      success: true,
      data: {
        staffId,
        month,
        year,
        basicPay,
        da: da.toFixed(2),
        hra: hra.toFixed(2),
        ta,
        grossSalary: grossSalary.toFixed(2),
        pfEmployee: pfEmployee.toFixed(2),
        pfEmployer: pfEmployer.toFixed(2),
        esi: esi.toFixed(2),
        professionalTax,
        incomeTax: incomeTax.toFixed(2),
        totalDeductions: totalDeductions.toFixed(2),
        netSalary: netSalary.toFixed(2),
      },
    });
  } catch (error) { next(error); }
});

router.post('/process', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { staffId, month, year, salaryData } = req.body;
    const salary = await prisma.salary.create({
      data: {
        staffId,
        userId: req.userId,
        month,
        year,
        ...salaryData,
      },
      include: { staff: true },
    });
    res.status(201).json({ success: true, data: salary });
  } catch (error) { next(error); }
});

router.get('/staff/:staffId', async (req, res, next) => {
  try {
    const { year } = req.query;
    const where = { staffId: req.params.staffId };
    if (year) where.year = parseInt(year);
    const salaries = await prisma.salary.findMany({
      where, include: { staff: true }, orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    res.json({ success: true, data: salaries });
  } catch (error) { next(error); }
});

router.get('/report', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const where = {};
    if (month) where.month = parseInt(month);
    if (year) where.year = parseInt(year);
    const salaries = await prisma.salary.findMany({
      where, include: { staff: true }, orderBy: { netSalary: 'desc' },
    });
    const totalGross = salaries.reduce((sum, s) => sum + parseFloat(s.grossSalary), 0);
    const totalNet = salaries.reduce((sum, s) => sum + parseFloat(s.netSalary), 0);
    const totalDeductions = salaries.reduce((sum, s) => sum + parseFloat(s.totalDeductions), 0);
    res.json({
      success: true,
      data: {
        salaries,
        summary: { totalGross, totalNet, totalDeductions, staffCount: salaries.length },
      },
    });
  } catch (error) { next(error); }
});

module.exports = router;
