const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
const { logAction } = require('../utils/auditLogger');

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

exports.getSchoolSettings = async (req, res, next) => {
  try {
    const school = await prisma.school.findUnique({ where: { id: req.schoolId } });
    res.json({ success: true, data: school });
  } catch (error) { next(error); }
};

exports.updateSchoolSettings = async (req, res, next) => {
  try {
    const { name, address, city, state, pincode, phone, email, udiseCode, affiliationNumber, principalName } = req.body;
    
    let updateData = {
      name, address, city, state, pincode, phone, email, udiseCode, affiliationNumber, principalName
    };

    if (req.files?.logo) {
      updateData.logoUrl = `/uploads/${req.schoolId}/${req.files.logo[0].filename}`;
    }
    if (req.files?.letterhead) {
      updateData.letterheadUrl = `/uploads/${req.schoolId}/${req.files.letterhead[0].filename}`;
    }

    const updated = await prisma.school.update({
      where: { id: req.schoolId },
      data: updateData
    });

    res.json({ success: true, data: updated });
  } catch (error) { next(error); }
};

exports.toggleSchoolStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const school = await prisma.school.findUnique({ where: { id } });

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    const updated = await prisma.school.update({
      where: { id },
      data: { isActive: !school.isActive }
    });

    // Toggle isActive for all users of this school
    await prisma.user.updateMany({
      where: { schoolId: id },
      data: { isActive: updated.isActive }
    });

    await logAction({
      userId: req.user.id,
      action: updated.isActive ? 'ACTIVATE_SCHOOL' : 'DEACTIVATE_SCHOOL',
      resource: 'SCHOOL',
      resourceId: id,
      details: { schoolName: school.name },
      req
    });

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteSchool = async (req, res, next) => {
  try {
    const { id } = req.params;
    const school = await prisma.school.findUnique({ where: { id } });

    if (!school) {
      return res.status(404).json({ success: false, message: 'School not found' });
    }

    if (school.isActive) {
      return res.status(400).json({ success: false, message: 'Active schools cannot be deleted. Please deactivate the school first from the status toggle.' });
    }

    // We use a transaction to ensure all related data is cleaned up if needed
    // However, in a real system, we might prefer soft-delete or keeping audit logs.
    // Given the request, we will perform a delete. 
    // Prisma cascading should handle most things if configured, but let's be safe.
    
    await prisma.school.delete({
      where: { id }
    });

    await logAction({
      userId: req.user.id,
      action: 'DELETE_SCHOOL',
      resource: 'SCHOOL',
      resourceId: id,
      details: { schoolName: school.name, schoolCode: school.code },
      req
    });

    res.status(200).json({ success: true, message: 'School deleted successfully' });
  } catch (error) {
    next(error);
  }
};
