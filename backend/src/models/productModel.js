const { pool } = require('../config/db');

const productModel = {
  async findProducts({
    page = 1,
    limit = 10,
    search = '',
    category = '',
    stock = '',
    status = '',
    sortBy = 'created_at',
    sortOrder = 'DESC'
  }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      whereClause += ' AND p.category_id = ?';
      params.push(parseInt(category));
    }

    if (status && ['active', 'inactive'].includes(status)) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    if (stock) {
      if (stock === 'low') {
        whereClause += ' AND p.stock > 0 AND p.stock <= 10';
      } else if (stock === 'out') {
        whereClause += ' AND p.stock = 0';
      } else if (stock === 'in') {
        whereClause += ' AND p.stock > 10';
      }
    }

    const allowedSortFields = {
      id: 'p.id',
      name: 'p.name',
      price: 'p.price',
      stock: 'p.stock',
      status: 'p.status',
      category: 'c.name',
      created_at: 'p.created_at'
    };

    const sortColumn = allowedSortFields[sortBy] || 'p.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.category_id, 
        c.name AS category_name, 
        p.price, 
        p.stock, 
        p.status, 
        p.created_at, 
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${sortColumn} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async countProducts({ search = '', category = '', stock = '', status = '' }) {
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ' AND (p.name LIKE ? OR c.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      whereClause += ' AND p.category_id = ?';
      params.push(parseInt(category));
    }

    if (status && ['active', 'inactive'].includes(status)) {
      whereClause += ' AND p.status = ?';
      params.push(status);
    }

    if (stock) {
      if (stock === 'low') {
        whereClause += ' AND p.stock > 0 AND p.stock <= 10';
      } else if (stock === 'out') {
        whereClause += ' AND p.stock = 0';
      } else if (stock === 'in') {
        whereClause += ' AND p.stock > 10';
      }
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

  async findById(id) {
    const query = `
      SELECT 
        p.id, 
        p.name, 
        p.category_id, 
        c.name AS category_name, 
        p.price, 
        p.stock, 
        p.status, 
        p.created_at, 
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  },

  async createProduct({ name, category_id, price, stock = 0, status = 'active' }) {
    const [result] = await pool.query(
      'INSERT INTO products (name, category_id, price, stock, status) VALUES (?, ?, ?, ?, ?)',
      [name, category_id, price, stock, status]
    );
    return result.insertId;
  },

  async updateProduct(id, fields) {
    const updates = [];
    const params = [];

    if (fields.name !== undefined) {
      updates.push('name = ?');
      params.push(fields.name);
    }
    if (fields.category_id !== undefined) {
      updates.push('category_id = ?');
      params.push(fields.category_id);
    }
    if (fields.price !== undefined) {
      updates.push('price = ?');
      params.push(fields.price);
    }
    if (fields.stock !== undefined) {
      updates.push('stock = ?');
      params.push(fields.stock);
    }
    if (fields.status !== undefined && ['active', 'inactive'].includes(fields.status)) {
      updates.push('status = ?');
      params.push(fields.status);
    }

    if (updates.length === 0) return false;

    params.push(id);
    const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
    const [result] = await pool.query(query, params);
    return result.affectedRows > 0;
  },

  async deleteProduct(id) {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

module.exports = productModel;
