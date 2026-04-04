const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { profile: true, student: true, staff: true, parent: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User not found or inactive', 401);
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    req.schoolId = user.schoolId;

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
  if (req.userRole === 'SUPER_ADMIN') {
    return next();
  }

  if (req.params.schoolId && req.params.schoolId !== req.schoolId) {
    throw new AppError('Access denied to this school', 403);
  }

  req.query.schoolId = req.schoolId;
  next();
};

module.exports = { authenticate, authorize, schoolScoped };
