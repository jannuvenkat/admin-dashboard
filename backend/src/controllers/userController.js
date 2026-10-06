const userService = require('../services/userService');

const userController = {
  // GET /api/users
  async getUsers(req, res, next) {
    try {
      const result = await userService.getAllUsers(req.query);
      return res.status(200).json({
        success: true,
        data: result.users,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/users/:id
  async getUserById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // POST /api/users
  async createUser(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required'
        });
      }

      const newUser = await userService.createUser({ name, email, password, role });
      return res.status(201).json({
        success: true,
        data: newUser
      });
    } catch (error) {
      if (error.message.includes('already registered')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // PUT /api/users/:id
  async updateUser(req, res, next) {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('already in use')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // DELETE /api/users/:id
  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      if (error.message === 'User not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('sole administrator')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
};

module.exports = userController;
