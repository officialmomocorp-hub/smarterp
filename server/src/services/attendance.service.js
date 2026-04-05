const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

class AttendanceService {
  async markAttendance(data, schoolId, markedBy) {
    const { date, attendanceRecords } = data;
    const attendanceDate = new Date(date);
    // Normalize to start of day
    attendanceDate.setHours(0, 0, 0, 0);

    const results = await prisma.$transaction(async (tx) => {
      const results = [];

      for (const record of attendanceRecords) {
        // Check if attendance already exists for this student+date
        const existing = await tx.attendance.findFirst({
          where: {
            studentId: record.studentId,
            date: attendanceDate,
          },
        });

        let attendance;
        if (existing) {
          // Update existing record
          attendance = await tx.attendance.update({
            where: { id: existing.id },
            data: {
              status: record.status,
              remarks: record.remarks || null,
              markedBy: markedBy || 'admin',
              markedAt: new Date(),
            },
          });
        } else {
          // Create new record
          attendance = await tx.attendance.create({
            data: {
              schoolId,
              studentId: record.studentId,
              date: attendanceDate,
              status: record.status,
              remarks: record.remarks || null,
              markedBy: markedBy || 'admin',
            },
          });
        }

        results.push(attendance);
      }

      return results;
    });

    return results;
  }

  async markStaffAttendance(data, schoolId) {
    const { staffId, date, checkInTime, checkOutTime } = data;
    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await prisma.attendance.findFirst({
      where: { staffId, date: attendanceDate },
    });

    let attendance;
    if (existing) {
      attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          status: 'PRESENT',
          checkInTime: checkInTime ? new Date(checkInTime) : undefined,
          checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
        },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          schoolId,
          staffId,
          date: attendanceDate,
          status: 'PRESENT',
          checkInTime: checkInTime ? new Date(checkInTime) : new Date(),
          markedBy: 'system',
        },
      });
    }

    return attendance;
  }

  async getAttendance(studentId, startDate, endDate) {
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: { date: 'asc' },
    });

    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;
    const halfDay = attendance.filter(a => a.status === 'HALF_DAY').length;
    const onLeave = attendance.filter(a => a.status === 'ON_LEAVE').length;

    const attendancePercentage = total > 0 ? ((present + (halfDay * 0.5)) / total * 100).toFixed(2) : 0;

    return {
      attendance,
      summary: {
        total,
        present,
        absent,
        late,
        halfDay,
        onLeave,
        attendancePercentage,
        belowMinimum: parseFloat(attendancePercentage) < 75,
      },
    };
  }

  async getClassAttendance(classId, sectionId, date) {
    const attendanceDate = new Date(date);

    const students = await prisma.student.findMany({
      where: {
        classId,
        sectionId,
        status: 'ACTIVE',
      },
      include: { profile: true },
      orderBy: { rollNumber: 'asc' },
    });

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        date: attendanceDate,
        studentId: { in: students.map(s => s.id) },
      },
    });

    const attendanceMap = {};
    attendanceRecords.forEach(record => {
      attendanceMap[record.studentId] = record;
    });

    return students.map(student => ({
      ...student,
      attendance: attendanceMap[student.id] || null,
    }));
  }

  async getMonthlyReport(schoolId, classId, month, year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendance = await prisma.attendance.findMany({
      where: {
        schoolId,
        date: { gte: startDate, lte: endDate },
        student: { classId },
      },
      include: { student: { include: { profile: true, class: true, section: true } } },
    });

    const studentMap = {};
    attendance.forEach(record => {
      if (!studentMap[record.studentId]) {
        studentMap[record.studentId] = {
          student: record.student,
          total: 0,
          present: 0,
          absent: 0,
          late: 0,
          halfDay: 0,
          onLeave: 0,
        };
      }

      studentMap[record.studentId].total++;
      if (record.status === 'PRESENT') studentMap[record.studentId].present++;
      if (record.status === 'ABSENT') studentMap[record.studentId].absent++;
      if (record.status === 'LATE') studentMap[record.studentId].late++;
      if (record.status === 'HALF_DAY') studentMap[record.studentId].halfDay++;
      if (record.status === 'ON_LEAVE') studentMap[record.studentId].onLeave++;
    });

    const report = Object.values(studentMap).map(s => ({
      ...s,
      attendancePercentage: s.total > 0 ? ((s.present + (s.halfDay * 0.5)) / s.total * 100).toFixed(2) : 0,
      belowMinimum: false,
    }));

    report.forEach(s => {
      s.belowMinimum = parseFloat(s.attendancePercentage) < 75;
    });

    return report;
  }

  async getAttendanceAlerts(schoolId, academicYearId) {
    const where = {
      schoolId,
      status: 'ACTIVE',
    };
    if (academicYearId) where.academicYearId = academicYearId;

    const students = await prisma.student.findMany({
      where,
      include: {
        profile: true,
        class: true,
        section: true,
        parents: { include: { parent: true } },
      },
    });

    const alerts = [];

    for (const student of students) {
      const attendance = await prisma.attendance.findMany({
        where: {
          studentId: student.id,
          date: {
            gte: new Date(new Date().getFullYear(), 0, 1),
          },
        },
      });

      const total = attendance.length;
      const present = attendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;

      if (total > 0) {
        const percentage = (present / total * 100).toFixed(2);
        if (parseFloat(percentage) < 75) {
          alerts.push({
            student,
            attendancePercentage: percentage,
            totalDays: total,
            presentDays: present,
            absentDays: total - present,
          });
        }
      }
    }

    return alerts;
  }
}

module.exports = new AttendanceService();
