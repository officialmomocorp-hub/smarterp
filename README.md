# 🏫 SmartERP — Indian School ERP System

[![CI/CD](https://github.com/smarterp-hub/smarterp/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/smarterp-hub/smarterp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A comprehensive, multi-tenant SaaS School ERP built for the Indian education system. Supports CBSE, ICSE, and State Board schools with 63+ database models covering every aspect of school administration.

🌐 **Live Demo:** [smarterpsolution.duckdns.org](https://smarterpsolution.duckdns.org)

---

## ✨ Features

| Module | Description |
|:-------|:------------|
| 🔐 Authentication | JWT-based, 5 roles (Super Admin, Admin, Teacher, Student, Parent) |
| 👨‍🎓 Student Management | Full CRUD, Transfer Certificates, status tracking |
| 📝 Admissions | Multi-step admission workflow with document management |
| 💰 Fee Management | Fee structures, payment tracking, receipts, defaulter lists |
| 📊 Examinations | Marks entry, report cards, seating arrangements, invigilation |
| 📋 Attendance | Daily attendance with class/section filtering |
| 👩‍🏫 Staff Management | Staff records, designations, department tracking |
| 📅 Timetable | Period-wise timetable with teacher assignments |
| 📚 Library | Book management, issue/return tracking |
| 💼 Salary Management | Payroll processing with salary slips |
| 🏠 Leave Management | Leave applications with approval workflow |
| 📢 Notices | School-wide notice board |
| 📄 PDF Generation | Transfer Certificates, Report Cards, Fee Receipts |
| 📈 Reports & Analytics | Comprehensive reporting with data export |
| 🏫 Multi-tenant | Complete school isolation with tenant-scoped middleware |

---

## 🛡️ Security Stack

- **Helmet.js** — HTTP security headers
- **CORS** — Strict origin policy
- **Rate Limiting** — Global (100/15min), Login (10/min), Password Reset (5/min)
- **XSS Protection** — Global sanitize-html middleware
- **IDOR Protection** — School-scoped tenant isolation
- **JWT Token Versioning** — Instant session invalidation on password change
- **Token Blacklist** — Individual session revocation
- **Password Policy** — Min 8 chars, uppercase, number, symbol, not last 3 passwords
- **Account Lockout** — 5 failed attempts = 30 min lock
- **bcrypt** — 12 salt rounds

---

## 🏗️ Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Frontend** | React 18, Vite, Zustand, React Router v6, Lucide Icons |
| **Backend** | Node.js, Express.js 4 |
| **Database** | PostgreSQL 15 + Prisma ORM |
| **Auth** | JWT (jsonwebtoken + bcryptjs) |
| **PDF** | PDFKit + Puppeteer |
| **Docs** | Swagger UI (swagger-jsdoc) |
| **Logging** | Winston |
| **Process** | PM2 |
| **CI/CD** | GitHub Actions |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/smarterp-hub/smarterp.git
cd smarterp

# Setup Backend
cd server
cp .env.example .env   # Configure DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev

# Setup Frontend (new terminal)
cd client
npm install
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://user:password@localhost:5432/smarterp
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=development
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## 🧪 Testing

```bash
cd server
npm test   # Runs API test suite
```

---

## 📦 Database Schema

63 Prisma models covering:
- School & Academic Structure (School, AcademicYear, Class, Section, Subject)
- User Management (User, Profile, PasswordHistory, TokenBlacklist)
- Students (Student, Admission, TransferCertificate)
- Academics (Exam, Mark, ReportCard, Homework, Syllabus, LessonPlan)
- Finance (FeeStructure, FeePayment, Salary, LedgerEntry)
- HR (Staff, LeaveApplication, Attendance)
- Infrastructure (Library, Transport, Hostel)
- Communication (Notice, Communication, WhatsAppMessage)
- Advanced (MeritCertificate, CharacterCertificate, RTE Quota, SiblingLink)

---

## 🔄 Backup

```bash
# Manual backup
./scripts/backup.sh

# Automated (add to crontab)
0 2 * * * /var/www/smarterp/scripts/backup.sh
```

---

## 📁 Project Structure

```
smarterp/
├── .github/workflows/     # CI/CD pipeline
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components (21 pages)
│   │   ├── services/      # API service layer
│   │   └── store/         # Zustand state management
│   └── public/
├── server/                # Express backend
│   ├── src/
│   │   ├── controllers/   # Route handlers
│   │   ├── middleware/     # Auth, sanitize, rate limit, validation
│   │   ├── routes/        # API routes (25 route files)
│   │   ├── services/      # Business logic
│   │   ├── config/        # DB, swagger, cron configs
│   │   └── utils/         # Logger, errors, helpers
│   ├── prisma/            # Schema + migrations
│   └── tests/             # API test suite
└── scripts/               # Backup & maintenance scripts
```

---

## 👥 User Roles

| Role | Access Level |
|:-----|:------------|
| **Super Admin** | Platform management: Create schools, reset admin passwords |
| **Admin** | Full school management: All modules within their school |
| **Teacher** | Attendance, marks entry, homework, timetable view |
| **Student** | View results, attendance, fees, homework |
| **Parent** | View child's performance, fees, communicate with teachers |

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
