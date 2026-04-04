const express = require('express');
const router = express.Router();
const { authenticate, authorize, schoolScoped } = require('../middleware/auth');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');
const XLSX = require('xlsx');

router.use(authenticate, schoolScoped);

// ==========================================
// FEATURE 4: UDISE+ DATA EXPORT
// ==========================================

router.get('/udise', authorize('SUPER_ADMIN', 'ADMIN'), async (req, res, next) => {
  try {
    const { year } = req.query;
    const currentYear = year || 'demo-academic-year';

    // School info
    const school = await prisma.school.findFirst({ where: { id: req.schoolId } });

    // Students by class, gender, category
    const students = await prisma.student.findMany({
      where: { schoolId: req.schoolId, academicYearId: currentYear, status: 'ACTIVE' },
      include: { profile: true, class: true, section: true },
    });

    // Enrollment data class-wise
    const enrollmentData = {};
    students.forEach(s => {
      const cls = s.class.name;
      const gender = s.profile.gender;
      const category = s.profile.casteCategory;
      const key = `${cls}_${gender}_${category}`;
      enrollmentData[key] = (enrollmentData[key] || 0) + 1;
    });

    // Teacher count
    const teachers = await prisma.staff.findMany({
      where: { schoolId: req.schoolId, status: 'Active' },
    });

    // Create Excel workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: School Info
    const schoolData = [
      ['UDISE+ Data Export'],
      ['School Name', school.name],
      ['UDISE Code', school.udiseCode],
      ['Address', school.address],
      ['Pincode', school.pincode],
      ['State', school.state],
      ['Management Type', school.schoolType],
      ['Medium of Instruction', school.mediumOfInstruction],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(schoolData);
    XLSX.utils.book_append_sheet(wb, ws1, 'School Info');

    // Sheet 2: Enrollment
    const enrollmentRows = [['Class', 'Boys-General', 'Boys-OBC', 'Boys-SC', 'Boys-ST', 'Girls-General', 'Girls-OBC', 'Girls-SC', 'Girls-ST']];
    const classes = [...new Set(students.map(s => s.class.name))].sort();
    classes.forEach(cls => {
      const row = [cls];
      ['MALE', 'FEMALE'].forEach(gender => {
        ['GENERAL', 'OBC', 'OBC_NCL', 'SC', 'ST'].forEach(cat => {
          const key = `${cls}_${gender}_${cat}`;
          row.push(enrollmentData[key] || 0);
        });
      });
      enrollmentRows.push(row);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(enrollmentRows);
    XLSX.utils.book_append_sheet(wb, ws2, 'Enrollment');

    // Sheet 3: Teachers
    const teacherRows = [['Employee ID', 'Name', 'Designation', 'Department', 'Qualification', 'B.Ed', 'M.Ed']];
    teachers.forEach(t => {
      teacherRows.push([t.staffId, t.qualification, t.designation, t.department, t.qualification, t.bEdQualified ? 'Yes' : 'No', t.mEdQualified ? 'Yes' : 'No']);
    });
    const ws3 = XLSX.utils.aoa_to_sheet(teacherRows);
    XLSX.utils.book_append_sheet(wb, ws3, 'Teachers');

    // Generate Excel file
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="UDISE-${year || '2025-26'}.xlsx"`);
    res.send(buffer);
  } catch (error) { next(error); }
});

// ==========================================
// FEATURE 5: ATTENDANCE 75% WARNING
// ==========================================

router.get('/below75/:classId', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const students = await prisma.student.findMany({
      where: { classId: req.params.classId, schoolId: req.schoolId, status: 'ACTIVE' },
      include: {
        profile: true,
        class: true,
        section: true,
        parents: { include: { parent: true } },
      },
    });

    const below75 = [];

    for (const student of students) {
      const attendance = await prisma.attendance.findMany({
        where: { studentId: student.id },
      });

      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const percentage = total > 0 ? (present / total * 100).toFixed(2) : 100;

      if (parseFloat(percentage) < 75) {
        below75.push({
          student: {
            id: student.id,
            studentId: student.studentId,
            name: `${student.profile.firstName} ${student.profile.lastName}`,
            class: student.class.name,
            section: student.section.name,
            parentPhone: student.parents?.[0]?.parent?.fatherPhone,
          },
          attendancePercentage: percentage,
          totalDays: total,
          presentDays: present,
          absentDays: total - present,
        });
      }
    }

    res.json({ success: true, data: below75 });
  } catch (error) { next(error); }
});

// Send SMS alert for low attendance
router.post('/sms-alert/:studentId', authorize('SUPER_ADMIN', 'ADMIN', 'TEACHER'), async (req, res, next) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.studentId },
      include: {
        profile: true,
        class: true,
        section: true,
        parents: { include: { parent: true } },
      },
    });

    if (!student) throw new AppError('Student not found', 404);

    const attendance = await prisma.attendance.findMany({ where: { studentId: student.id } });
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const percentage = total > 0 ? (present / total * 100).toFixed(2) : 100;

    const parentPhone = student.parents?.[0]?.parent?.fatherPhone;
    if (!parentPhone) throw new AppError('Parent phone not found', 400);

    // SMS would be sent here via MSG91/Textlocal API
    // const smsMessage = `Dear Parent, ${student.profile.firstName} of Class ${student.class.name} attendance is ${percentage}%. Minimum 75% required.`;
    // await sendSMS(parentPhone, smsMessage);

    res.json({
      success: true,
      data: {
        studentName: `${student.profile.firstName} ${student.profile.lastName}`,
        class: student.class.name,
        attendancePercentage: percentage,
        parentPhone,
        smsSent: false, // Would be true if SMS API configured
        message: `Attendance alert ready for ${parentPhone}`,
      },
    });
  } catch (error) { next(error); }
});

// Monthly attendance report
router.get('/monthly-report/:classId', async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const students = await prisma.student.findMany({
      where: { classId: req.params.classId, schoolId: req.schoolId, status: 'ACTIVE' },
      include: { profile: true, class: true, section: true },
    });

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);

    const report = [];

    for (const student of students) {
      const attendance = await prisma.attendance.findMany({
        where: {
          studentId: student.id,
          date: { gte: startDate, lte: endDate },
        },
      });

      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
      const percentage = total > 0 ? (present / total * 100).toFixed(2) : 100;

      report.push({
        studentId: student.studentId,
        name: `${student.profile.firstName} ${student.profile.lastName}`,
        totalDays: total,
        presentDays: present,
        absentDays: total - present,
        attendancePercentage: percentage,
        below75: parseFloat(percentage) < 75,
      });
    }

    res.json({ success: true, data: report });
  } catch (error) { next(error); }
});

module.exports = router;
