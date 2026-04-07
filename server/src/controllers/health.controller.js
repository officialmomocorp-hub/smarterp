const { logger } = require('../utils/logger');
const prisma = require('../config/database');
const os = require('os');

exports.checkHealth = async (req, res) => {
  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      free: os.freemem(),
      total: os.totalmem(),
      usage: 1 - os.freemem() / os.totalmem(),
    },
    services: {
      database: 'UNKNOWN',
      server: 'OK',
    }
  };

  try {
    // Basic DB check
    await prisma.$queryRaw`SELECT 1`;
    healthData.services.database = 'OK';
  } catch (err) {
    healthData.status = 'DOWN';
    healthData.services.database = 'DOWN';
    logger.error('Health Check Database Failure', err);
  }

  const statusCode = healthData.status === 'UP' ? 200 : 503;
  res.status(statusCode).json(healthData);
};
