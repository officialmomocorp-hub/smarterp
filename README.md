# Smarterp - Indian School ERP System

A comprehensive full-stack Enterprise Resource Planning (ERP) system designed specifically for Indian schools, supporting CBSE, ICSE, and State Board curricula.

## Features

### Core Modules
- **Admission Management** - Online admission forms, document uploads, auto student ID generation
- **Student Management** - Complete profiles with Aadhar, UDISE, caste category, family details
- **Attendance Management** - Daily tracking, 75% alerts, leave applications, biometric-ready
- **Fee Management** - Multiple fee heads, concessions (RTE/SC/ST), installments, Razorpay integration, late fines
- **Examination & Marks** - CCE pattern, grade calculation (A1-E), report cards, merit lists
  - **3-Level Verification Workflow** - Teacher → HOD → Principal approval chain
  - **Hall Ticket System** - Auto-generate with QR code, masked Aadhar, exam schedule
  - **Seating Arrangement** - Auto-generate with section mixing, room assignment
  - **Answer Book Tracking** - Barcode-based distribution, checking status tracking
  - **Excel Bulk Marks Upload** - Template download, validation, color coding
  - **Enhanced Grade Calculation** - CBSE, CCE (NEP 2020), State Board patterns
  - **Compartment Management** - Auto-identify eligible students, separate exam scheduling
  - **Result Analytics** - Pass/fail charts, subject averages, top/bottom 10, failure heatmap
  - **AI Smart Remarks** - Auto-generated Hindi+English remarks based on marks
  - **Recheck Applications** - Online application with fee payment
  - **Health Records** - Annual height, weight, blood group tracking
- **Staff/HR Management** - Profiles, salary with PF/ESI/PT, Form 16, leave management
- **Timetable Management** - Period-wise scheduling, substitute teacher tracking
- **Library Management** - Book catalog, issue/return, fine calculation
- **Transport Management** - Routes, stops, vehicle tracking, GPS-ready
- **Hostel Management** - Room allotment, warden management, mess tracking
- **Communication** - SMS/WhatsApp integration, notice board, circulars
- **Government Reports** - UDISE+ format, RTE tracking, DISE reports

### Indian-Specific Features
- All 28 states + 8 UTs
- Caste categories: General, OBC, OBC-NCL, SC, ST
- Indian academic year (April-March)
- Classes: Nursery, LKG, UKG, Class 1-12
- CBSE grading system (A1, A2, B1, B2, C1, C2, D, E)
- Indian currency format (₹ with lakh/crore)
- Aadhar integration fields
- RTE 25% EWS seat tracking
- Mid-Day Meal (PM POSHAN) tracking
- BPL/APL status
- Scholarship management (Pre-matric, Post-matric, Merit-cum-Means)
- Indian national holidays

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL with Prisma ORM
- JWT Authentication + RBAC
- Multer for file uploads
- Winston for logging
- Swagger for API documentation

### Frontend
- React.js + Vite
- Tailwind CSS
- Zustand for state management
- React Router for navigation
- Chart.js for analytics
- Axios for API calls
- Lucide React icons

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb smarterp

# Or using psql
psql -U postgres
CREATE DATABASE smarterp;
\q

# Update DATABASE_URL in server/.env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/smarterp?schema=public"

# Run Prisma migrations
cd server
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed the database with demo data
npm run db:seed
```

### 3. Start Development Servers

```bash
# Start backend (from server directory)
npm run dev
# Server runs on http://localhost:5000

# Start frontend (from client directory)
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@smarterp.in | admin123 |
| Teacher | teacher@smarterp.in | admin123 |

### 5. API Documentation

Swagger documentation is available at: `http://localhost:5000/api-docs`

## Project Structure

```
smarterp/
├── server/
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── seed.js          # Demo data seeder
│   ├── src/
│   │   ├── config/          # Database, Swagger config
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Auth, validation, upload
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helpers, logger
│   │   └── index.js         # Entry point
│   ├── uploads/             # File storage
│   └── logs/                # Application logs
└── client/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── pages/           # Page components
    │   ├── services/        # API client
    │   ├── store/           # Zustand stores
    │   ├── App.jsx          # Router setup
    │   └── main.jsx         # Entry point
    └── index.html
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/change-password` - Change password
- `GET /api/v1/auth/profile` - Get user profile

### Students
- `GET /api/v1/students` - List students (paginated)
- `POST /api/v1/students` - Create student
- `GET /api/v1/students/:id` - Get student details
- `PUT /api/v1/students/:id` - Update student
- `DELETE /api/v1/students/:id` - Delete student
- `GET /api/v1/students/statistics` - Get statistics
- `GET /api/v1/students/defaulters` - Fee defaulters

### Fees
- `POST /api/v1/fees/structure` - Create fee structure
- `GET /api/v1/fees/structure` - Get fee structure
- `POST /api/v1/fees/payment` - Record payment
- `GET /api/v1/fees/student/:id` - Student fee status
- `GET /api/v1/fees/defaulters` - Defaulter list
- `GET /api/v1/fees/collection-report` - Collection report
- `POST /api/v1/fees/razorpay/order` - Create Razorpay order
- `POST /api/v1/fees/razorpay/verify` - Verify payment

### Attendance
- `POST /api/v1/attendance/mark` - Mark attendance
- `GET /api/v1/attendance/student/:id` - Student attendance
- `GET /api/v1/attendance/class/:id` - Class attendance
- `GET /api/v1/attendance/report/monthly` - Monthly report
- `GET /api/v1/attendance/alerts` - Low attendance alerts
- `POST /api/v1/attendance/leave` - Apply leave
- `PUT /api/v1/attendance/leave/:id/approve` - Approve leave

### Exams
- `POST /api/v1/exams` - Create exam
- `POST /api/v1/exams/marks` - Enter marks
- `POST /api/v1/exams/marks/bulk` - Bulk marks entry
- `GET /api/v1/exams/result/student/:id` - Student result
- `GET /api/v1/exams/merit-list` - Merit list
- `POST /api/v1/exams/:id/publish` - Publish results

### Dashboard
- `GET /api/v1/dashboard/admin` - Admin dashboard data
- `GET /api/v1/dashboard/teacher` - Teacher dashboard data
- `GET /api/v1/dashboard/parent` - Parent dashboard data

## User Roles

1. **Super Admin** - Full access to all modules
2. **Admin** - School office staff access
3. **Teacher** - Class management, attendance, marks entry
4. **Student** - View own records, results, fees
5. **Parent** - View children's records, pay fees

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Account lockout after failed attempts
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation
- Audit logging
- Aadhar number encryption ready

## Production Deployment

### Backend
```bash
# Build and start
NODE_ENV=production npm start

# Or use PM2
pm2 start src/index.js --name smarterp-api
```

### Frontend
```bash
# Build for production
npm run build

# Serve with nginx or any static server
```

### Database
```bash
# Run migrations in production
npx prisma migrate deploy
```

## Environment Variables

See `server/.env.example` for all available configuration options including:
- Database connection
- JWT secrets
- SMS API (MSG91)
- WhatsApp API
- Razorpay payment gateway
- SMTP email settings

## License

MIT

## Support

For issues and feature requests, please create an issue in the repository.
