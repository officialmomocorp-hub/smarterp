const studentService = require('../services/student.service');
const { AppError } = require('../utils/appError');

class StudentController {
  async create(req, res, next) {
    try {
      const student = await studentService.create(req.body, req.schoolId);
      res.status(201).json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const result = await studentService.findAll(req.schoolId, req.query);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async findById(req, res, next) {
    try {
      const student = await studentService.findById(req.params.id, req.schoolId);
      res.json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const student = await studentService.update(req.params.id, req.schoolId, req.body);
      res.json({ success: true, data: student });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await studentService.delete(req.params.id, req.schoolId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getStatistics(req, res, next) {
    try {
      const academicYearId = req.query.academicYearId;
      const stats = await studentService.getStatistics(req.schoolId, academicYearId);
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }

  async getDefaulterList(req, res, next) {
    try {
      const academicYearId = req.query.academicYearId;
      const defaulters = await studentService.getDefaulterList(req.schoolId, academicYearId);
      res.json({ success: true, data: defaulters });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
