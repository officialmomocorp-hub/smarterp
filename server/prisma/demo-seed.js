const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up and seeding demo data...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  // 1. Create/Update School
  const school = await prisma.school.upsert({
    where: { code: 'DEMO001' },
    update: {
        name: 'Delhi Public School',
        email: 'info@dpsdemo.edu.in',
    },
    create: {
      name: 'Delhi Public School',
      code: 'DEMO001',
      address: '123 Education Street, Sector 15',
      city: 'New Delhi',
      state: 'DELHI',
      pincode: '110001',
      phone: '011-12345678',
      email: 'info@dpsdemo.edu.in',
      udiseCode: '09010123456',
      affiliationNumber: 'CBSE-2700001',
      principalName: 'Dr. Rajesh Kumar',
      establishmentYear: 1990,
      status: 'ACTIVE',
    },
  });

  // 2. Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { id: 'demo-ay-2025' },
    update: { status: 'ACTIVE', isCurrent: true },
    create: {
      id: 'demo-ay-2025',
      schoolId: school.id,
      name: '2025-2026',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      status: 'ACTIVE',
      isCurrent: true,
    },
  });

  // 3. Create Class and Section
  const demoClass = await prisma.class.upsert({
    where: { id: 'demo-class-5' },
    update: {},
    create: {
      id: 'demo-class-5',
      schoolId: school.id,
      academicYearId: academicYear.id,
      name: 'Class 5',
      displayName: 'Class 5',
      sortOrder: 5,
    },
  });

  const demoSection = await prisma.section.upsert({
    where: { id: 'demo-section-5a' },
    update: {},
    create: {
      id: 'demo-section-5a',
      classId: demoClass.id,
      name: 'A',
      capacity: 40,
    },
  });

  // 4. Create School Admin
  await prisma.user.upsert({
    where: { email: 'info@dpsdemo.edu.in' },
    update: { password: hashedPassword, role: 'ADMIN', schoolId: school.id },
    create: {
      email: 'info@dpsdemo.edu.in',
      phone: '9988776655',
      password: hashedPassword,
      role: 'ADMIN',
      schoolId: school.id,
      profile: {
        create: {
          firstName: 'DPS',
          lastName: 'Admin',
          gender: 'MALE',
          dateOfBirth: new Date('1985-01-01'),
        },
      },
    },
  });

  // 5. Create Teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@smarterp.in' },
    update: { password: hashedPassword, role: 'TEACHER', schoolId: school.id },
    create: {
      email: 'teacher@smarterp.in',
      phone: '9876543211',
      password: hashedPassword,
      role: 'TEACHER',
      schoolId: school.id,
      profile: {
        create: {
          firstName: 'Sunita',
          lastName: 'Sharma',
          gender: 'FEMALE',
          dateOfBirth: new Date('1990-05-15'),
        },
      },
      staff: {
        create: {
          schoolId: school.id,
          staffId: 'STF001',
          employeeCode: 'DEMO_TEA_001',
          designation: 'Teacher',
          department: 'General',
          qualification: 'M.A., B.Ed.',
          basicPay: 45000,
          dateOfJoining: new Date('2020-01-01'),
        },
      },
    },
  });

  // 6. Create Subject
  const subject = await prisma.subject.upsert({
      where: { id: 'demo-subject-math' },
      update: { teacherId: teacherUser.id },
      create: {
          id: 'demo-subject-math',
          name: 'Mathematics',
          code: 'MATH05',
          classId: demoClass.id,
          sectionId: demoSection.id,
          teacherId: teacherUser.id,
      }
  });

  // 7. Create Timetable (Today)
  const today = new Date().getDay();
  await prisma.timetable.upsert({
      where: { id: 'demo-tt-1' },
      update: {},
      create: {
          id: 'demo-tt-1',
          schoolId: school.id,
          classId: demoClass.id,
          sectionId: demoSection.id,
          dayOfWeek: today,
          period: 1,
          subjectId: subject.id,
          teacherId: teacherUser.id,
          startTime: '08:00',
          endTime: '08:45',
      }
  });

  // 8. Create Student
  const studentUser = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: { password: hashedPassword, role: 'STUDENT', schoolId: school.id },
    create: {
      phone: '9999999999',
      password: hashedPassword,
      role: 'STUDENT',
      schoolId: school.id,
      profile: {
        create: {
            firstName: 'Aarav',
            lastName: 'Verma',
            gender: 'MALE',
            dateOfBirth: new Date('2015-08-20'),
        }
      },
      student: {
        create: {
          schoolId: school.id,
          studentId: 'STU2025001',
          classId: demoClass.id,
          sectionId: demoSection.id,
          rollNumber: 1,
          academicYearId: academicYear.id,
          dateOfAdmission: new Date('2024-04-01'),
          profile: {
            create: {
              firstName: 'Aarav',
              lastName: 'Verma',
              gender: 'MALE',
              dateOfBirth: new Date('2015-08-20'),
              casteCategory: 'General',
              religion: 'Hindu',
              motherTongue: 'Hindi',
              aadharNumber: '123456789012',
            },
          },
        },
      },
    },
    include: { student: true },
  });

  // 9. Create Parent
  const parentUser = await prisma.user.upsert({
    where: { phone: '9888888888' },
    update: { password: hashedPassword, role: 'PARENT', schoolId: school.id },
    create: {
      phone: '9888888888',
      password: hashedPassword,
      role: 'PARENT',
      schoolId: school.id,
      profile: {
        create: {
          firstName: 'Rajesh',
          lastName: 'Verma',
          gender: 'MALE',
          dateOfBirth: new Date('1980-10-10'),
        },
      },
    },
  });

  const parentRec = await prisma.parent.upsert({
      where: { userId: parentUser.id },
      update: { schoolId: school.id },
      create: {
          userId: parentUser.id,
          schoolId: school.id,
          fatherName: 'Rajesh Verma',
          fatherPhone: '9888888888',
          motherName: 'Sunita Verma',
          motherPhone: '9888888887',
          address: 'Demo Address, New Delhi',
          city: 'New Delhi',
          state: 'DELHI',
          pincode: '110001',
      }
  });

  // Link Parent to Student
  const student = await prisma.student.findFirst({ where: { userId: studentUser.id } });
  
  await prisma.parentStudent.upsert({
    where: {
      parentId_studentId: {
        parentId: parentRec.id,
        studentId: student.id,
      },
    },
    update: {},
    create: {
      parentId: parentRec.id,
      studentId: student.id,
      relation: 'Father',
      isPrimary: true,
    },
  });

  console.log('Demo seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
