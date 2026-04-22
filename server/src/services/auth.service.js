const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class AuthService {
  async login(emailOrPhone, password) {
    console.log('--- Login Attempt ---', emailOrPhone);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone }
        ]
      },
      include: { school: true }
    });

    if (!user) {
      console.log('Result: User not found');
      throw new Error('Invalid credentials');
    }

    if (!user.isActive || (user.school && !user.school.isActive)) {
      console.log('Result: Account/School disabled');
      throw new Error('Invalid credentials or account disabled');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Result: Password mismatch');
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        userId: user.id,
        role: user.role, 
        schoolId: user.schoolId,
        tokenVersion: user.tokenVersion || 0 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Result: Login Success');
    const { password: _, ...sanitized } = user;
    return { user: sanitized, token };
  }

  async registerSchool(data) {
    const { 
      schoolName, adminEmail, adminPassword, adminName, plan, phone, 
      address, city, state, pincode, udiseCode, schoolCode
    } = data;

    const existingUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existingUser) throw new Error('Email already registered');

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    return await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: schoolName,
          code: schoolCode || ('SCH-' + Date.now()),
          plan: plan || 'STARTER',
          phone: phone || 'N/A',
          email: adminEmail,
          address: address || 'N/A',
          city: city || 'N/A',
          state: state || 'N/A',
          pincode: pincode || 'N/A',
          udiseCode: udiseCode || ('UD-' + Date.now()),
          isActive: true
        }
      });

      const user = await tx.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          role: 'SCHOOL_ADMIN',
          schoolId: school.id,
          phone: phone
        }
      });

      return { school, user: { id: user.id, email: user.email, name: user.name, role: user.role } };
    });
  }

  async logout(userId) {
    return true;
  }
}

module.exports = new AuthService();
