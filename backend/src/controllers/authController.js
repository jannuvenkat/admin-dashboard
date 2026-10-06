const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');
const generateToken = require('../utils/generateToken');

const authController = {
  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Please provide email and password'
        });
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password'
        });
      }

      // Role check: Only admin can access the administration dashboard
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Administrator privileges required to access the dashboard'
        });
      }

      const token = generateToken(user.id, user.role);

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me
  async me(req, res, next) {
    try {
      return res.status(200).json({
        success: true,
        data: req.user
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  }
};

module.exports = authController;
