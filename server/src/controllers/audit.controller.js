const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

class AuditController {
  async getLogs(req, res, next) {
    try {
      const { schoolId } = req;
      const { 
        userId, 
        action, 
        resource, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 50 
      } = req.query;

      const where = { schoolId };

      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (resource) where.resource = resource;
      if (startDate && endDate) {
        where.createdAt = {
          gte: new Date(startDate),
          lte: new Date(endDate),
        };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              include: {
                profile: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.auditLog.count({ where }),
      ]);

      res.json({
        success: true,
        data: logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getLogById(req, res, next) {
    try {
      const { id } = req.params;
      const { schoolId } = req;

      const log = await prisma.auditLog.findFirst({
        where: { id, schoolId },
        include: {
          user: {
            include: {
              profile: true
            }
          }
        },
      });

      if (!log) {
        throw new AppError('Audit log not found', 404);
      }

      res.json({ success: true, data: log });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuditController();
