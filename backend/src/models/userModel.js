const { pool } = require('../config/db');

const userModel = {
  // Find user by email (including password for auth comparison)
  async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT id, name, email, password, role, created_at, updated_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  // Find user by id (safe, without password)
  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  // Paginated search & list users
  async findUsers({ page = 1, limit = 10, search = '', role = '', sortBy = 'created_at', sortOrder = 'DESC' }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role && ['admin', 'user'].includes(role)) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const allowedSortFields = ['id', 'name', 'email', 'role', 'created_at'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Count total matching users
  async countUsers({ search = '', role = '' }) {
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (role && ['admin', 'user'].includes(role)) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    const query = `SELECT COUNT(*) AS total FROM users ${whereClause}`;
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

  // Create a new user
  async createUser({ name, email, password, role = 'user' }) {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, password, role]
    );
    return result.insertId;
  },

  // Update existing user
  async updateUser(id, fields) {
    const updates = [];
    const params = [];

    if (fields.name !== undefined) {
      updates.push('name = ?');
      params.push(fields.name);
    }
    if (fields.email !== undefined) {
      updates.push('email = ?');
      params.push(fields.email);
    }
    if (fields.password !== undefined && fields.password !== '') {
      updates.push('password = ?');
      params.push(fields.password);
    }
    if (fields.role !== undefined && ['admin', 'user'].includes(fields.role)) {
      updates.push('role = ?');
      params.push(fields.role);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(query, params);
    return result.affectedRows > 0;
  },

  // Delete user
  async deleteUser(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = userModel;
