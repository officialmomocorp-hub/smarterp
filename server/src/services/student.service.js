const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

class StudentService {
  async create(data, schoolId) {
    const { profile, parentData, class: className, section, ...studentData } = data;

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
        { studentId: { contains: search, mode: 'insensitive' } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
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

  async update(id, schoolId, data) {
    const student = await prisma.student.findFirst({
      where: { id, schoolId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const { profile, parentData, ...studentData } = data;

    return prisma.$transaction(async (tx) => {
      const updatedStudent = await tx.student.update({
        where: { id },
        data: studentData,
      });

      if (profile) {
        await tx.studentProfile.update({
          where: { studentId: id },
          data: profile,
        });
      }

      return tx.student.findUnique({
        where: { id },
        include: {
          profile: true,
          class: true,
          section: true,
          parents: { include: { parent: true } },
        },
      });
    });
  }

  async delete(id, schoolId) {
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

  generateStudentId(schoolCode, className, section, rollNumber) {
    const year = new Date().getFullYear().toString().slice(-2);
    const classCode = className.replace('Class ', '').replace('Nursery', 'N').replace('LKG', 'LK').replace('UKG', 'UK');
    const sectionCode = section.charAt(0).toUpperCase();
    return `STU${year}${classCode.padStart(2, '0')}${sectionCode}${rollNumber.toString().padStart(3, '0')}`;
  }
}

module.exports = new StudentService();
