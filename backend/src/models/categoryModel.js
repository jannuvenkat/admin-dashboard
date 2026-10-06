const { pool } = require('../config/db');

const categoryModel = {
  async getAll() {
    const [rows] = await pool.query(
      'SELECT id, name, created_at FROM categories ORDER BY name ASC'
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, created_at FROM categories WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create(name) {
    const [result] = await pool.query(
      'INSERT INTO categories (name) VALUES (?)',
      [name]
    );
    return result.insertId;
  }
};

module.exports = categoryModel;
