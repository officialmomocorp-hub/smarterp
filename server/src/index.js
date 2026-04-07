const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');
const { AppError } = require('./utils/appError');

dotenv.config();

const app = express();

// Global performance
app.use(compression());

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false, // For local testing
}));

app.use(cors({
  origin: [
    'http://localhost:8000', 
    'http://localhost:5173', 
    'http://localhost:3000',
    'https://smarterpsolution.duckdns.org',
    'http://103.179.97.107'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // Higher for production
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

const { xssSanitizer } = require('./middleware/sanitize');

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(xssSanitizer);

// Static files (Serve Vite build)
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/students', require('./routes/student.routes'));
app.use('/api/v1/admissions', require('./routes/admission.routes'));
app.use('/api/v1/attendance', require('./routes/attendance.routes'));
app.use('/api/v1/fees', require('./routes/fee.routes'));
app.use('/api/v1/exams', require('./routes/exam.routes'));
app.use('/api/v1/exams-enhanced', require('./routes/examEnhanced.routes'));
app.use('/api/v1/staff', require('./routes/staff.routes'));
app.use('/api/v1/timetable', require('./routes/timetable.routes'));
app.use('/api/v1/library', require('./routes/library.routes'));
app.use('/api/v1/transport', require('./routes/transport.routes'));
app.use('/api/v1/hostel', require('./routes/hostel.routes'));
app.use('/api/v1/notices', require('./routes/notice.routes'));
app.use('/api/v1/communications', require('./routes/communication.routes'));
app.use('/api/v1/academic', require('./routes/academic.routes'));
app.use('/api/v1/dashboard', require('./routes/dashboard.routes'));
app.use('/api/v1/reports', require('./routes/report.routes'));
app.use('/api/v1/salary', require('./routes/salary.routes'));
app.use('/api/v1/leaves', require('./routes/leave.routes'));
app.use('/api/v1/pdf', require('./routes/pdf.routes'));
app.use('/api/v1/reports-enhanced', require('./routes/reportEnhanced.routes'));
app.use('/api/v1/parent', require('./routes/parent.routes'));
app.use('/api/v1/homework', require('./routes/homework.routes'));
app.use('/api/v1/phase3', require('./routes/phase3.routes'));
app.use('/api/v1/schools', require('./routes/school.routes'));
app.use('/api/v1/platform', require('./routes/platform.routes'));

// Cron jobs
require('./config/cron');

// Catch-all route to serve React app for SPA routing
app.get('*', (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: 'API Endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;
