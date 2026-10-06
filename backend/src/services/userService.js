const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const userService = {
  async getAllUsers(params) {
    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;
    const search = params.search || '';
    const role = params.role || '';
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'DESC';

    const users = await userModel.findUsers({ page, limit, search, role, sortBy, sortOrder });
    const total = await userModel.countUsers({ search, role });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  async getUserById(id) {
    const user = await userModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async createUser({ name, email, password, role }) {
    const existing = await userModel.findByEmail(email);
    if (existing) {
      throw new Error('Email is already registered');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUserId = await userModel.createUser({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    return await userModel.findById(newUserId);
  },

  async updateUser(id, updateData) {
    const user = await userModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    if (updateData.email && updateData.email !== user.email) {
      const existing = await userModel.findByEmail(updateData.email);
      if (existing && existing.id !== parseInt(id)) {
        throw new Error('Email is already in use by another user');
      }
    }

    const fieldsToUpdate = { ...updateData };
    if (updateData.password && updateData.password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      fieldsToUpdate.password = await bcrypt.hash(updateData.password, salt);
    } else {
      delete fieldsToUpdate.password;
    }

    await userModel.updateUser(id, fieldsToUpdate);
    return await userModel.findById(id);
  },

  async deleteUser(id) {
    const user = await userModel.findById(id);
    if (!user) {
      throw new Error('User not found');
    }
    if (user.role === 'admin') {
      const [adminUsers] = await userModel.findUsers({ role: 'admin', limit: 10 });
      if (adminUsers.length <= 1) {
        throw new Error('Cannot delete the sole administrator account');
      }
    }
    await userModel.deleteUser(id);
    return true;
  }
};

module.exports = userService;
