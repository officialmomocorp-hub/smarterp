const authService = require('../services/auth.service');
const { AppError } = require('../utils/appError');
const { logAction, Actions, Resources } = require('../utils/auditLogger');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      res.cookie('token', result.token, cookieOptions);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { emailOrPhone, password } = req.body;

      if (!emailOrPhone || !password) {
        throw new AppError('Email/phone and password are required', 400);
      }

      const result = await authService.login(emailOrPhone, password);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      };

      res.cookie('token', result.token, cookieOptions);
      
      await logAction({
        schoolId: result.user.schoolId,
        userId: result.user.id,
        action: Actions.LOGIN,
        resource: 'AUTH',
        req,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const result = await authService.refreshToken(req.userId);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400);
      }

      const result = await authService.changePassword(req.userId, currentPassword, newPassword);
      
      await logAction({
        schoolId: req.schoolId,
        userId: req.userId,
        action: Actions.UPDATE,
        resource: 'AUTH',
        resourceId: req.userId,
        newValue: { action: 'PASSWORD_CHANGE' },
        req,
      });

      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { emailOrPhone } = req.body;
      const result = await authService.forgotPassword(emailOrPhone);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { resetToken, newPassword } = req.body;
      const result = await authService.resetPassword(resetToken, newPassword);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.sanitizeUser(req.user);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
  async logout(req, res, next) {
    try {
      const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
      if (!token) throw new AppError('Token not provided', 400);

      const result = await authService.logout(token, req.userId);

      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict'
      };

      res.clearCookie('token', cookieOptions);
      
      await logAction({
        schoolId: req.schoolId,
        userId: req.userId,
        action: 'LOGOUT',
        resource: 'AUTH',
        req,
      });

      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
