const feeService = require('../services/fee.service');
const { AppError } = require('../utils/appError');

class FeeController {
  async createFeeStructure(req, res, next) {
    try {
      const feeStructure = await feeService.createFeeStructure(req.body, req.schoolId, req.user?.id, req);
      res.status(201).json({ success: true, data: feeStructure });
    } catch (error) {
      next(error);
    }
  }

  async getFeeStructure(req, res, next) {
    try {
      const { classId, academicYearId } = req.query;
      const feeStructure = await feeService.getFeeStructure(req.schoolId, classId, academicYearId);
      res.json({ success: true, data: feeStructure });
    } catch (error) {
      next(error);
    }
  }

  async createConcession(req, res, next) {
    try {
      const concession = await feeService.createConcession(req.body, req.schoolId, req.user?.id, req);
      res.status(201).json({ success: true, data: concession });
    } catch (error) {
      next(error);
    }
  }

  async processPayment(req, res, next) {
    try {
      const payment = await feeService.processPayment(req.body, req.schoolId, req.userId, req);
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  }

  async getStudentFeeStatus(req, res, next) {
    try {
      const { studentId } = req.params;
      const { academicYearId } = req.query;
      const feeStatus = await feeService.getStudentFeeStatus(studentId, req.schoolId, academicYearId);
      res.json({ success: true, data: feeStatus });
    } catch (error) {
      next(error);
    }
  }

  async getDefaulterList(req, res, next) {
    try {
      const { academicYearId } = req.query;
      const defaulters = await feeService.getDefaulterList(req.schoolId, academicYearId, req.query);
      res.json({ success: true, data: defaulters });
    } catch (error) {
      next(error);
    }
  }

  async getCollectionReport(req, res, next) {
    try {
      const { academicYearId } = req.query;
      const report = await feeService.getCollectionReport(req.schoolId, academicYearId, req.query);
      res.json({ success: true, data: report });
    } catch (error) {
      next(error);
    }
  }

  async createRazorpayOrder(req, res, next) {
    try {
      const { studentId, feePaymentId, amount } = req.body;
      const order = await feeService.createRazorpayOrder(studentId, feePaymentId, amount);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async verifyRazorpayPayment(req, res, next) {
    try {
      const result = await feeService.verifyRazorpayPayment(req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FeeController();
