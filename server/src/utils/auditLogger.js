const prisma = require('../config/database');
const { logger } = require('./logger');

/**
 * Log an action to the AuditLog table.
 * @param {Object} params - Audit log parameters
 */
const logAction = async ({ schoolId, userId, action, resource, resourceId, oldValue, newValue, req }) => {
  try {
    const logData = {
      schoolId,
      userId,
      action,
      resource,
      resourceId,
      oldValue: oldValue ? (typeof oldValue === 'string' ? JSON.parse(oldValue) : oldValue) : null,
      newValue: newValue ? (typeof newValue === 'string' ? JSON.parse(newValue) : newValue) : newValue,
      ipAddress: req?.ip || null,
      userAgent: req?.headers['user-agent'] || null,
    };

    await prisma.auditLog.create({
      data: logData
    });
  } catch (error) {
    // We don't want audit logging to break the main application flow, but we should log the error
    logger.error('Failed to create audit log entry', { error, metadata: { action, resource, resourceId } });
  }
};

module.exports = {
  logAction,
  Actions: {
    CREATE: 'CREATE',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    LOGIN: 'LOGIN',
    DOWNLOAD: 'DOWNLOAD'
  },
  Resources: {
    STUDENT: 'STUDENT',
    FEE: 'FEE',
    ADMISSION: 'ADMISSION',
    STAFF: 'STAFF',
    EXAM: 'EXAM'
  }
};
