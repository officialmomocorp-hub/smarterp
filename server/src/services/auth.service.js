const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { AppError } = require('../utils/appError');

class AuthService {
  async register(data) {
    const { email, phone, password, role, schoolId, profile, ...additionalData } = data;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email } : {},
          { phone },
        ].filter(Boolean),
      },
    });

    if (existingUser) {
      throw new AppError('User already exists with this email or phone', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          phone,
          password: hashedPassword,
          role,
          schoolId,
        },
      });

      if (profile) {
        await tx.profile.create({
          data: {
            userId: newUser.id,
            ...profile,
          },
        });
      }

      if (role === 'STUDENT' && additionalData.studentData) {
        await tx.student.create({
          data: {
            userId: newUser.id,
            schoolId,
            ...additionalData.studentData,
          },
        });
      }

      if (role === 'PARENT' && additionalData.parentData) {
        await tx.parent.create({
          data: {
            userId: newUser.id,
            schoolId,
            ...additionalData.parentData,
          },
        });
      }

      if (role === 'TEACHER' && additionalData.staffData) {
        await tx.staff.create({
          data: {
            userId: newUser.id,
            schoolId,
            ...additionalData.staffData,
          },
        });
      }

      return newUser;
    });

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  async login(emailOrPhone, password) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
      include: { profile: true, student: true, staff: true, parent: true },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403);
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new AppError('Account is temporarily locked. Try again later', 403);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const failedAttempts = user.failedLoginAttempts + 1;

      if (failedAttempts >= 5) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: new Date(Date.now() + 30 * 60 * 1000),
          },
        });
        throw new AppError('Too many failed attempts. Account locked for 30 minutes', 403);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: failedAttempts },
      });

      throw new AppError('Invalid credentials', 401);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lastLogin: new Date(),
      },
    });

    const token = this.generateToken(user);

    return { user: this.sanitizeUser(user), token };
  }

  async refreshToken(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid user', 401);
    }

    const token = this.generateToken(user);
    return { token };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);

    if (!isValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedPassword,
          tokenVersion: { increment: 1 }
        },
      }),
      prisma.passwordHistory.create({
        data: {
          userId,
          hashedPassword
        }
      })
    ]);

    return { message: 'Password changed successfully' };
  }

  async forgotPassword(emailOrPhone) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });

    if (!user) {
      // Security: Do not reveal if user exists. Return generic success message.
      return { message: 'If an account exists with this email/phone, a reset link will be sent.' };
    }

    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // In a real app, send the email here. For now, we return the token (standard demo behavior).
    return { resetToken, message: 'If an account exists with this email/phone, a reset link will be sent.' };
  }

  async resetPassword(resetToken, newPassword) {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);

    if (decoded.type !== 'password_reset') {
      throw new AppError('Invalid reset token', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    await prisma.$transaction([
      prisma.user.update({
        where: { id: decoded.userId },
        data: { 
          password: hashedPassword,
          tokenVersion: { increment: 1 }
        },
      }),
      prisma.passwordHistory.create({
        data: {
          userId: decoded.userId,
          hashedPassword
        }
      })
    ]);

    return { message: 'Password reset successfully' };
  }

  async logout(token, userId) {
    const decoded = jwt.decode(token);
    const expiry = new Date(decoded.exp * 1000);

    await prisma.tokenBlacklist.create({
      data: {
        token,
        userId,
        expiry,
      },
    });

    return { message: 'Logged out successfully' };
  }

  generateToken(user) {
    return jwt.sign(
      {
        userId: user.id,
        role: user.role,
        schoolId: user.schoolId,
        version: user.tokenVersion,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

module.exports = new AuthService();
