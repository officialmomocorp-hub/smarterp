const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

class LeaveService {
  async createLeave(data, schoolId, appliedBy) {
    const leave = await prisma.leaveApplication.create({
      data: {
        schoolId,
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        appliedBy,
      },
      include: {
        student: { include: { profile: true, class: true, section: true } },
        staff: { include: { user: true } },
      },
    });

    return leave;
  }

  async getLeaves(schoolId, query = {}) {
    const { status, type, studentId, staffId, page = 1, limit = 20 } = query;

    const where = { schoolId };

    if (status) where.status = status;
    if (type) where.leaveType = type;
    if (studentId) where.studentId = studentId;
    if (staffId) where.staffId = staffId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [leaves, total] = await Promise.all([
      prisma.leaveApplication.findMany({
        where,
        include: {
          student: { include: { profile: true, class: true, section: true } },
          staff: { include: { user: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.leaveApplication.count({ where }),
    ]);

    return {
      leaves,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async approveLeave(leaveId, userId, status, rejectionReason) {
    const leave = await prisma.leaveApplication.update({
      where: { id: leaveId },
      data: {
        status,
        rejectionReason,
        approvedBy: userId,
        approvedAt: new Date(),
      },
    });

    return leave;
  }

  async getLeaveBalance(staffId, year) {
    const leaves = await prisma.leaveApplication.findMany({
      where: {
        staffId,
        startDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31),
        },
        status: 'APPROVED',
      },
    });

    const clUsed = leaves.filter(l => l.leaveType === 'CL').length;
    const elUsed = leaves.filter(l => l.leaveType === 'EL').length;
    const mlUsed = leaves.filter(l => l.leaveType === 'ML').length;
    const medicalUsed = leaves.filter(l => l.leaveType === 'MEDICAL').length;

    return {
      cl: { total: 12, used: clUsed, balance: 12 - clUsed },
      el: { total: 30, used: elUsed, balance: 30 - elUsed },
      ml: { total: 10, used: mlUsed, balance: 10 - mlUsed },
      medical: { total: 15, used: medicalUsed, balance: 15 - medicalUsed },
    };
  }
}

module.exports = new LeaveService();
