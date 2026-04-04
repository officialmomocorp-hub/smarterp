const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const school = await prisma.school.findFirst();
  if (!school) { console.log('No school found'); return; }
  
  // Find current academic year
  let ay = await prisma.academicYear.findFirst({ where: { schoolId: school.id } });
  if (!ay) {
    ay = await prisma.academicYear.create({
      data: {
        schoolId: school.id,
        name: '2025-26',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2026-03-31'),
        isCurrent: true,
        status: 'ACTIVE'
      }
    });
  }

  // Create class/section
  let cls = await prisma.class.findFirst({ where: { schoolId: school.id, name: 'Class 5' } });
  if (!cls) {
    cls = await prisma.class.create({
      data: {
        schoolId: school.id,
        academicYearId: ay.id,
        name: 'Class 5',
        displayName: '5th Standard',
        sortOrder: 5
      }
    });
  }

  let sec = await prisma.section.findFirst({ where: { classId: cls.id, name: 'A' } });
  if (!sec) {
    sec = await prisma.section.create({
      data: {
        classId: cls.id,
        name: 'A'
      }
    });
  }

  // Create ADMIN user
  const bcrypt = require('bcryptjs');
  const password = await bcrypt.hash('admin123', 10);
  let adminUser = await prisma.user.findFirst({ where: { email: 'schooladmin@smarterp.in' } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        schoolId: school.id,
        email: 'schooladmin@smarterp.in',
        phone: '9999999999',
        password,
        role: 'ADMIN'
      }
    });
  }

  // Create 50 students
  console.log('Generating 50 students...');
  for (let i = 1; i <= 50; i++) {
    const studentId = `STU2025${i.toString().padStart(3, '0')}`;
    const firstName = `Student${i}`;
    const lastName = `Lastname${i}`;
    
    await prisma.student.create({
      data: {
        schoolId: school.id,
        academicYearId: ay.id,
        classId: cls.id,
        sectionId: sec.id,
        studentId,
        rollNumber: i,
        profile: {
          create: {
            firstName,
            lastName,
            dateOfBirth: new Date('2015-05-15'),
            gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
            casteCategory: 'GENERAL',
            religion: 'HINDU',
            motherTongue: 'HINDI',
            aadharNumber: `1234567890${i.toString().padStart(2, '0')}`
          }
        }
      }
    });
  }
  console.log('50 students generated locally for testing!');
}

main().catch(console.error).finally(()=>prisma.$disconnect());
