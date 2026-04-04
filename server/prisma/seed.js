const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create School
  const school = await prisma.school.upsert({
    where: { code: 'DEMO001' },
    update: {},
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
      rteApproved: true,
      midDayMealEnabled: true,
    },
  });

  console.log('School created:', school.name);

  // Create Super Admin
  const existingAdmin = await prisma.user.findFirst({ where: { phone: '9876543210' } });
  const superAdmin = existingAdmin || await prisma.user.create({
      data: {
      schoolId: school.id,
      email: 'admin@smarterp.in',
      phone: '9876543210',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'User',
          dateOfBirth: new Date('1980-01-01'),
          gender: 'MALE',
        },
      },
    },
  });

  console.log('Super Admin created:', superAdmin.email);

  // Create Academic Year
  const academicYear = await prisma.academicYear.upsert({
    where: { id: 'demo-academic-year' },
    update: {},
    create: {
      id: 'demo-academic-year',
      schoolId: school.id,
      name: '2025-2026',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      status: 'ACTIVE',
      isCurrent: true,
    },
  });

  console.log('Academic Year created:', academicYear.name);

  // Create Classes
  const classNames = [
    { name: 'Nursery', displayName: 'Nursery', sortOrder: 1 },
    { name: 'LKG', displayName: 'LKG', sortOrder: 2 },
    { name: 'UKG', displayName: 'UKG', sortOrder: 3 },
    { name: 'Class 1', displayName: 'Class 1', sortOrder: 4 },
    { name: 'Class 2', displayName: 'Class 2', sortOrder: 5 },
    { name: 'Class 3', displayName: 'Class 3', sortOrder: 6 },
    { name: 'Class 4', displayName: 'Class 4', sortOrder: 7 },
    { name: 'Class 5', displayName: 'Class 5', sortOrder: 8, hasCce: true },
    { name: 'Class 6', displayName: 'Class 6', sortOrder: 9, hasCce: true },
    { name: 'Class 7', displayName: 'Class 7', sortOrder: 10, hasCce: true },
    { name: 'Class 8', displayName: 'Class 8', sortOrder: 11, hasCce: true },
    { name: 'Class 9', displayName: 'Class 9', sortOrder: 12, isBoardClass: true },
    { name: 'Class 10', displayName: 'Class 10', sortOrder: 13, isBoardClass: true },
    { name: 'Class 11', displayName: 'Class 11', sortOrder: 14, isBoardClass: true },
    { name: 'Class 12', displayName: 'Class 12', sortOrder: 15, isBoardClass: true },
  ];

  for (const cls of classNames) {
    const existing = await prisma.class.findFirst({
      where: { schoolId: school.id, academicYearId: academicYear.id, name: cls.name },
    });
    if (!existing) {
      await prisma.class.create({
        data: {
          schoolId: school.id,
          academicYearId: academicYear.id,
          name: cls.name,
          displayName: cls.displayName,
          sortOrder: cls.sortOrder,
          hasCce: cls.hasCce || false,
          isBoardClass: cls.isBoardClass || false,
          sections: {
            create: [
              { name: 'A', capacity: 40 },
              { name: 'B', capacity: 40 },
            ],
          },
        },
      });
    }
  }

  console.log('Classes and sections created');

  // Create Holidays (Indian National + State)
  const holidays = [
    { name: 'Republic Day', date: new Date('2025-01-26'), type: 'National', isNational: true },
    { name: 'Independence Day', date: new Date('2025-08-15'), type: 'National', isNational: true },
    { name: 'Gandhi Jayanti', date: new Date('2025-10-02'), type: 'National', isNational: true },
    { name: 'Diwali', date: new Date('2025-10-20'), type: 'Festival', isNational: true },
    { name: 'Holi', date: new Date('2025-03-14'), type: 'Festival', isNational: true },
    { name: 'Christmas', date: new Date('2025-12-25'), type: 'Festival', isNational: true },
    { name: 'Eid-ul-Fitr', date: new Date('2025-03-31'), type: 'Festival', isNational: true },
    { name: 'Guru Nanak Jayanti', date: new Date('2025-11-05'), type: 'Festival', isNational: true },
    { name: 'Ambedkar Jayanti', date: new Date('2025-04-14'), type: 'National', isNational: true },
    { name: 'Makar Sankranti', date: new Date('2025-01-14'), type: 'Festival', isNational: true },
    { name: 'Summer Vacation Start', date: new Date('2025-05-15'), type: 'Vacation' },
    { name: 'Summer Vacation End', date: new Date('2025-06-30'), type: 'Vacation' },
    { name: 'Winter Vacation Start', date: new Date('2025-12-20'), type: 'Vacation' },
    { name: 'Winter Vacation End', date: new Date('2026-01-05'), type: 'Vacation' },
  ];

  for (const holiday of holidays) {
    await prisma.holiday.upsert({
      where: { id: `holiday-${holiday.name.replace(/\s/g, '-').toLowerCase()}` },
      update: {},
      create: {
        id: `holiday-${holiday.name.replace(/\s/g, '-').toLowerCase()}`,
        schoolId: school.id,
        ...holiday,
      },
    });
  }

  console.log('Holidays created');

  // Create Demo Teacher
  const existingTeacher = await prisma.user.findFirst({ where: { phone: '9876543211' } });
  const teacher = existingTeacher || await prisma.user.create({
    data: {
      schoolId: school.id,
      email: 'teacher@smarterp.in',
      phone: '9876543211',
      password: hashedPassword,
      role: 'TEACHER',
      profile: {
        create: {
          firstName: 'Sunita',
          lastName: 'Sharma',
          dateOfBirth: new Date('1990-05-15'),
          gender: 'FEMALE',
        },
      },
      staff: {
        create: {
          schoolId: school.id,
          staffId: 'STF250001',
          employeeCode: 'EMP001',
          designation: 'Senior Teacher',
          department: 'Mathematics',
          qualification: 'M.Sc, B.Ed',
          bEdQualified: true,
          dateOfJoining: new Date('2018-04-01'),
          employmentType: 'Permanent',
          basicPay: 45000,
        },
      },
    },
  });

  console.log('Teacher created:', teacher.email);

  // Create Demo Student
  const class5 = await prisma.class.findFirst({
    where: { schoolId: school.id, academicYearId: academicYear.id, name: 'Class 5' },
    include: { sections: true },
  });

  if (class5) {
    const studentUser = await prisma.user.create({
      data: {
        schoolId: school.id,
        phone: '9999999999',
        password: '',
        role: 'STUDENT',
        student: {
          create: {
            schoolId: school.id,
            studentId: 'STU2505A001',
            classId: class5.id,
            sectionId: class5.sections[0].id,
            rollNumber: 1,
            academicYearId: academicYear.id,
            house: 'RED',
            midDayMealOpted: true,
            profile: {
              create: {
                firstName: 'Aarav',
                middleName: 'Kumar',
                lastName: 'Verma',
                dateOfBirth: new Date('2014-03-15'),
                gender: 'MALE',
                casteCategory: 'GENERAL',
                religion: 'HINDU',
                motherTongue: 'HINDI',
                aadharNumber: '123456789012',
                nationality: 'Indian',
              },
            },
          },
        },
      },
      include: { student: true },
    });

    const parent = await prisma.parent.create({
      data: {
        schoolId: school.id,
        fatherName: 'Rajesh Verma',
        fatherOccupation: 'Business',
        fatherPhone: '9999999999',
        motherName: 'Priya Verma',
        motherOccupation: 'Homemaker',
        motherPhone: '9999999998',
        address: '456, Green Park, New Delhi',
        city: 'New Delhi',
        state: 'DELHI',
        pincode: '110016',
        annualIncome: 800000,
      },
    });

    await prisma.parentStudent.create({
      data: {
        parentId: parent.id,
        studentId: studentUser.student.id,
        relation: 'Parent',
        isPrimary: true,
      },
    });

    console.log('Demo student and parent created');
  }

  // Create Fee Structure for Class 5
  if (class5) {
    const existingFee = await prisma.feeStructure.findFirst({
      where: { schoolId: school.id, academicYearId: academicYear.id, classId: class5.id },
    });
    if (!existingFee) {
      await prisma.feeStructure.create({
        data: {
          schoolId: school.id,
          academicYearId: academicYear.id,
          classId: class5.id,
          name: 'Class 5 Fee Structure 2025-2026',
          feeHeads: JSON.stringify([
            { name: 'Tuition Fee', amount: 15000 },
            { name: 'Development Fee', amount: 5000 },
            { name: 'Lab Fee', amount: 2000 },
            { name: 'Sports Fee', amount: 1500 },
            { name: 'Library Fee', amount: 1000 },
            { name: 'Computer Fee', amount: 2000 },
            { name: 'Annual Charges', amount: 3000 },
            { name: 'Exam Fee', amount: 1500 },
          ]),
          totalAmount: 31000,
          installmentType: 'QUARTERLY',
          dueDates: JSON.stringify([
            { installment: 1, amount: 7750, date: '2025-04-15', label: 'Q1 (Apr-Jun)' },
            { installment: 2, amount: 7750, date: '2025-07-15', label: 'Q2 (Jul-Sep)' },
            { installment: 3, amount: 7750, date: '2025-10-15', label: 'Q3 (Oct-Dec)' },
            { installment: 4, amount: 7750, date: '2026-01-15', label: 'Q4 (Jan-Mar)' },
          ]),
          lateFinePerDay: 5,
          gstPercentage: 0,
        },
      });
      console.log('Fee structure created for Class 5');
    }
  }

  console.log('\n=== Seed completed successfully ===');
  console.log('\nDemo Credentials:');
  console.log('Super Admin: admin@smarterp.in / admin123');
  console.log('Teacher: teacher@smarterp.in / admin123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
