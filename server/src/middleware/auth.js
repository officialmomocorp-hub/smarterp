const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.query.token;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const blacklisted = await prisma.tokenBlacklist.findUnique({
      where: { token }
    });
    if (blacklisted) {
      throw new AppError('This session has been revoked. Please log in again.', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true, student: true, staff: true, parent: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    if (decoded.version !== undefined && user.tokenVersion !== decoded.version) {
       throw new AppError('Session expired due to security update. Please log in again.', 401);
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;

    const impersonatedSchoolId = req.headers['x-school-id'];
    if (user.role === 'SUPER_ADMIN' && impersonatedSchoolId) {
       req.schoolId = impersonatedSchoolId;
    } else {
       req.schoolId = user.schoolId;
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired', 401));
    }
    next(error);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      throw new AppError('Insufficient permissions', 403);
    }
    next();
  };
};

const schoolScoped = async (req, res, next) => {
  if (req.userRole === 'SUPER_ADMIN' && !req.schoolId) {
    return next(new AppError('Forbidden: Super Admins without an assigned school are restricted to the platform management panel.', 403));
  }

  if (req.params.schoolId && req.params.schoolId !== req.schoolId) {
    return next(new AppError('Access Denied: You do not have permission to view or modify data for another school.', 403));
  }

  req.query.schoolId = req.schoolId;
  next();
};

module.exports = { authenticate, authorize, schoolScoped };
