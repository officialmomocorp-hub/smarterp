const prisma = require('../config/database');
const { AppError } = require('../utils/appError');
const xlsx = require('xlsx');
const fs = require('fs');
const { logAction, Actions, Resources } = require('../utils/auditLogger');

class StudentService {
  async importStudents(filePath, schoolId) {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const currentYear = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true }
    });

    if (!currentYear) {
      throw new AppError('No active academic year found. Please set one first.', 400);
    }

    let count = 0;
    const results = [];

    // Cleanup file synchronously after reading
    try { fs.unlinkSync(filePath); } catch (e) {}

    for (const row of data) {
      try {
        // Map excel columns to student data structure
        const studentData = {
          profile: {
            firstName: row.firstName || row['First Name'],
            lastName: row.lastName || row['Last Name'] || 'Student',
            dateOfBirth: row.dateOfBirth || row['DOB'] ? new Date(row.dateOfBirth || row['DOB']) : new Date(),
            gender: row.gender || row['Gender'] || 'OTHER',
            aadharNumber: row.aadharNumber || row['Aadhar'] || 'N/A',
            address: row.address || row['Address'] || '',
          },
          parentData: {
            fatherName: row.fatherName || row['Father Name'] || 'N/A',
            fatherPhone: row.fatherPhone?.toString() || row['Father Phone']?.toString() || '',
            motherName: row.motherName || row['Mother Name'] || 'N/A',
            motherPhone: row.motherPhone?.toString() || row['Mother Phone']?.toString() || '',
          },
          class: (row.class || row['Class'] || '').toString(),
          section: (row.section || row['Section'] || 'A').toString(),
          city: row.city || row['City'] || '',
          state: row.state || row['State'] || '',
          pincode: row.pincode?.toString() || row['Pincode']?.toString() || '',
        };

        if (!studentData.class || !studentData.profile.firstName) continue;

        await this.create(studentData, schoolId);
        count++;
      } catch (err) {
        console.error(`Failed to import row: ${JSON.stringify(row)}`, err);
      }
    }

    return { count, total: data.length };
  }

  async create(data, schoolId, userId, req = null) {
    const { profile, parentData, class: className, section, ...studentData } = data;

    if (profile && profile.dateOfBirth) {
      profile.dateOfBirth = new Date(profile.dateOfBirth);
    }

    const classRecord = await prisma.class.findFirst({
      where: { schoolId, name: className },
      include: { sections: true },
    });

    if (!classRecord) {
      throw new AppError('Class not found', 404);
    }

    const sectionRecord = classRecord.sections.find(s => s.name === section);
    if (!sectionRecord) {
      throw new AppError('Section not found', 404);
    }

    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { schoolId, isCurrent: true },
    });

    if (!currentAcademicYear) {
      throw new AppError('No active academic year found', 400);
    }

    const lastStudent = await prisma.student.findFirst({
      where: { 
        classId: classRecord.id, 
        sectionId: sectionRecord.id, 
        academicYearId: currentAcademicYear.id,
        schoolId 
      },
      orderBy: { rollNumber: 'desc' },
      select: { rollNumber: true }
    });

    const rollNumber = lastStudent ? lastStudent.rollNumber + 1 : 1;
    const studentId = this.generateStudentId(schoolId, classRecord.name, section, rollNumber);

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          schoolId,
          phone: parentData?.fatherPhone || parentData?.motherPhone || '',
          email: null,
          password: '',
          role: 'STUDENT',
        },
      });

      const newStudent = await tx.student.create({
        data: {
          schoolId,
          studentId,
          classId: classRecord.id,
          sectionId: sectionRecord.id,
          rollNumber,
          academicYearId: currentAcademicYear.id,
          userId: user.id,
          ...studentData,
        },
      });

      await tx.studentProfile.create({
        data: {
          studentId: newStudent.id,
          ...profile,
        },
      });

      if (parentData && parentData.annualIncome !== undefined) {
        if (parentData.annualIncome === null || parentData.annualIncome === '') {
          parentData.annualIncome = 0;
        } else {
          parentData.annualIncome = parseFloat(parentData.annualIncome) || 0;
        }
      }

      let parent = await tx.parent.findFirst({
        where: {
          schoolId,
          OR: [
            { fatherPhone: parentData?.fatherPhone },
            { motherPhone: parentData?.motherPhone },
          ],
        },
      });

      if (!parent) {
        parent = await tx.parent.create({
          data: {
            schoolId,
            ...parentData,
          },
        });
      }

      await tx.parentStudent.create({
        data: {
          parentId: parent.id,
          studentId: newStudent.id,
          relation: 'Parent',
          isPrimary: true,
        },
      });

      return tx.student.findUnique({
        where: { id: newStudent.id },
        include: {
          profile: true,
          class: { include: { sections: true } },
          section: true,
          parents: { include: { parent: true } },
        },
      });
    });

    return student;
  }

  async findAll(schoolId, query = {}) {
    const { class: className, section, search, status, page = 1, limit = 20 } = query;

    const where = { schoolId, status: status || 'ACTIVE' };

    if (className) {
      where.class = { name: className };
    }

    if (section) {
      where.section = { name: section };
    }

    if (search) {
      where.OR = [
        { studentId: { contains: search } },
        { profile: { firstName: { contains: search } } },
        { profile: { lastName: { contains: search } } },
        { profile: { aadharNumber: { contains: search } } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          profile: true,
          class: true,
          section: true,
          parents: { include: { parent: true } },
        },
        skip,
        take: parseInt(limit),
        orderBy: [{ class: { sortOrder: 'asc' } }, { rollNumber: 'asc' }],
      }),
      prisma.student.count({ where }),
    ]);

    return {
      students,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async findById(id, schoolId) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
      include: {
        profile: true,
        class: true,
        section: true,
        parents: { include: { parent: true } },
        attendance: { take: 30, orderBy: { date: 'desc' } },
        feePayments: { take: 10, orderBy: { createdAt: 'desc' } },
        marks: { include: { exam: true, subject: true } },
        bookIssues: { include: { book: true }, where: { status: 'Issued' } },
        homeworks: { include: { homework: true }, take: 10 },
      },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    return student;
  }

  async update(id, schoolId, data, userId = 'system', req = null) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const { profile, parentData, class: className, section, ...studentData } = data;

    if (className && section) {
      const classRecord = await prisma.class.findFirst({
        where: { schoolId, name: className },
        include: { sections: true },
      });
      if (classRecord) {
        studentData.classId = classRecord.id;
        const sectionRecord = classRecord.sections.find(s => s.name === section);
        if (sectionRecord) {
          studentData.sectionId = sectionRecord.id;
        }
      }
    }

    if (profile && profile.dateOfBirth) {
      profile.dateOfBirth = new Date(profile.dateOfBirth);
    }

    return prisma.$transaction(async (tx) => {
      const baseUpdate = await tx.student.update({
        where: { id },
        data: studentData,
      });

      if (profile) {
        await tx.studentProfile.update({
          where: { studentId: id },
          data: profile,
        });
      }

      const fullUpdatedStudent = await tx.student.findUnique({
        where: { id },
        include: {
          profile: true,
          class: true,
          section: true,
          parents: { include: { parent: true } },
        },
      });

      // Audit Log for Student Update
      await logAction({
        schoolId,
        userId,
        action: Actions.UPDATE,
        resource: Resources.STUDENT,
        resourceId: id,
        oldValue: { status: student.status },
        newValue: fullUpdatedStudent,
        req,
      });

      return fullUpdatedStudent;
    });
  }

  async delete(id, schoolId, userId = 'system', req = null) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    await prisma.student.update({
      where: { id },
      data: { status: 'DROPPED_OUT' },
    });

    // Audit Log for Student Withdrawal
    await logAction({
      schoolId,
      userId,
      action: Actions.DELETE,
      resource: Resources.STUDENT,
      resourceId: id,
      newValue: { status: 'DROPPED_OUT' },
      req,
    });

    return { message: 'Student deleted successfully' };
  }

  async getStatistics(schoolId, academicYearId) {
    const [total, genderWise, classWise, casteWise, houseWise] = await Promise.all([
      prisma.student.count({ where: { schoolId, academicYearId, status: 'ACTIVE' } }),
      prisma.student.groupBy({
        by: ['profile.gender'],
        where: { schoolId, academicYearId, status: 'ACTIVE' },
        _count: true,
      }),
      prisma.student.groupBy({
        by: ['classId'],
        where: { schoolId, academicYearId, status: 'ACTIVE' },
        _count: true,
      }),
      prisma.student.groupBy({
        by: ['profile.casteCategory'],
        where: { schoolId, academicYearId, status: 'ACTIVE' },
        _count: true,
      }),
      prisma.student.groupBy({
        by: ['house'],
        where: { schoolId, academicYearId, status: 'ACTIVE' },
        _count: true,
      }),
    ]);

    return { total, genderWise, classWise, casteWise, houseWise };
  }

  async getDefaulterList(schoolId, academicYearId) {
    const defaulters = await prisma.student.findMany({
      where: {
        schoolId,
        academicYearId,
        status: 'ACTIVE',
        feePayments: {
          some: {
            status: { in: ['PENDING', 'OVERDUE'] },
          },
        },
      },
      include: {
        profile: true,
        class: true,
        section: true,
        feePayments: {
          where: { status: { in: ['PENDING', 'OVERDUE'] } },
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    return defaulters;
  }

  async convertFromAdmission(admissionId, schoolId, userId = 'system', req = null) {
    const admission = await prisma.admission.findFirst({
      where: { id: admissionId, schoolId, status: 'APPROVED' },
    });

    if (!admission) {
      throw new AppError('Approved admission not found', 404);
    }

    const data = {
      profile: {
        firstName: admission.applicantName.split(' ')[0],
        lastName: admission.applicantName.split(' ').slice(1).join(' ') || 'Student',
        dateOfBirth: admission.dateOfBirth,
        gender: admission.gender,
        casteCategory: admission.casteCategory,
        religion: admission.religion,
        motherTongue: admission.motherTongue,
        aadharNumber: admission.aadharNumber || 'N/A',
      },
      parentData: {
        fatherName: admission.fatherName,
        fatherOccupation: admission.fatherOccupation,
        fatherPhone: admission.fatherPhone,
        motherName: admission.motherName,
        motherOccupation: admission.motherOccupation,
        motherPhone: admission.motherPhone,
        annualIncome: admission.annualIncome,
        address: admission.address,
        city: admission.city,
        state: admission.state,
        pincode: admission.pincode,
      },
      class: admission.classApplied,
      section: admission.sectionPreferred || 'A',
      dateOfAdmission: new Date(),
    };

    const student = await this.create(data, schoolId, userId, req);

    // Update admission record
    await prisma.admission.update({
      where: { id: admissionId },
      data: { 
        status: 'CONVERTED', 
        studentId: student.id 
      }
    });

    return student;
  }

  generateStudentId(schoolCode, className, section, rollNumber) {
    const year = new Date().getFullYear().toString().slice(-2);
    const classCode = className.replace('Class ', '').replace('Nursery', 'N').replace('LKG', 'LK').replace('UKG', 'UK');
    const sectionCode = section.charAt(0).toUpperCase();
    return `STU${year}${classCode.padStart(2, '0')}${sectionCode}${rollNumber.toString().padStart(3, '0')}`;
  }
}

module.exports = new StudentService();
