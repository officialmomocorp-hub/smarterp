const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const dailyRotateTransport = (level) => new winston.transports.DailyRotateFile({
  filename: path.join(__dirname, `../../logs/${level}-%DATE%.log`),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  level: level === 'combined' ? 'info' : 'error'
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'smarterp-api' },
  transports: [
    dailyRotateTransport('error'),
    dailyRotateTransport('combined'),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, service }) => {
        return `[${timestamp}] ${service} ${level}: ${message}`;
      })
    ),
  }));
}

module.exports = { logger };
