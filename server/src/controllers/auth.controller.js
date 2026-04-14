const authService = require('../services/auth.service');

class AuthController {
  async login(req, res) {
    try {
      const { emailOrPhone, email, password } = req.body;
      const result = await authService.login(emailOrPhone || email, password);
      
      res.cookie('token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (error) {
      console.error('Login controller error:', error.message);
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async registerSchool(req, res) {
    try {
      const result = await authService.registerSchool(req.body);
      res.status(201).json({
        success: true,
        message: 'Institution registered successfully! You can now log in.',
        data: result
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async logout(req, res) {
    try {
      if (req.user && req.user.id) {
        await authService.logout(req.user.id);
      }
      res.clearCookie('token');
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      res.clearCookie('token');
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new AuthController();
