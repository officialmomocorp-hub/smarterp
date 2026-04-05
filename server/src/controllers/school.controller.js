const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

exports.createSchool = async (req, res, next) => {
  try {
    const { name, code, address, city, state, pincode, phone, email, udiseCode, adminEmail, adminPassword } = req.body;
    
    if(!name || !code || !adminEmail || !adminPassword) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const school = await prisma.school.create({
      data: {
        name, code, address, city, state, pincode, phone, email, udiseCode,
        academicYears: {
          create: {
            name: '2025-2026',
            startDate: new Date('2025-04-01'),
            endDate: new Date('2026-03-31'),
            isCurrent: true,
          }
        },
        users: {
          create: {
            email: adminEmail,
            phone: phone || '0000000000',
            password: hashedPassword,
            role: 'ADMIN',
            profile: {
              create: {
                 firstName: 'School',
                 lastName: 'Admin',
                 dateOfBirth: new Date('1980-01-01'),
                 gender: 'MALE'
              }
            }
          }
        }
      }
    });

    res.status(201).json({ success: true, data: school });
  } catch (error) {
    next(error);
  }
};

exports.getSchools = async (req, res, next) => {
  try {
    const schools = await prisma.school.findMany({
      include: { users: { where: { role: 'ADMIN' }, select: { email: true } } }
    });
    res.status(200).json({ success: true, data: schools });
  } catch (error) {
    next(error);
  }
};

exports.resetAdminPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if(!newPassword) {
      return res.status(400).json({ success: false, message: 'New password is required' });
    }

    // Find the first ADMIN of this school
    const adminUser = await prisma.user.findFirst({
      where: { schoolId: id, role: 'ADMIN' }
    });

    if (!adminUser) {
      return res.status(404).json({ success: false, message: 'Admin not found for this school' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: adminUser.id },
        data: { 
          password: hashedPassword,
          tokenVersion: { increment: 1 }
        }
      }),
      prisma.passwordHistory.create({
        data: {
          userId: adminUser.id,
          hashedPassword
        }
      })
    ]);

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
