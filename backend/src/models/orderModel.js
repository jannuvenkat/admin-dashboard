const { pool } = require('../config/db');

const orderModel = {
  async findOrders({
    page = 1,
    limit = 10,
    search = '',
    status = '',
    startDate = '',
    endDate = '',
    sortBy = 'created_at',
    sortOrder = 'DESC'
  }) {
    const offset = (page - 1) * limit;
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ? OR o.id = ?)';
      params.push(`%${search}%`, `%${search}%`, isNaN(search) ? -1 : parseInt(search));
    }

    if (status && ['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    if (startDate) {
      whereClause += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }

    const allowedSortFields = {
      id: 'o.id',
      total_amount: 'o.total_amount',
      status: 'o.status',
      created_at: 'o.created_at',
      customer: 'u.name'
    };

    const sortColumn = allowedSortFields[sortBy] || 'o.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        o.id, 
        o.user_id, 
        u.name AS customer_name, 
        u.email AS customer_email,
        o.total_amount, 
        o.status, 
        o.created_at, 
        o.updated_at,
        p.payment_method,
        p.payment_status
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON p.order_id = o.id
      ${whereClause}
      ORDER BY ${sortColumn} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;
    params.push(parseInt(limit), parseInt(offset));

    const [rows] = await pool.query(query, params);
    return rows;
  },

  async countOrders({ search = '', status = '', startDate = '', endDate = '' }) {
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ? OR o.id = ?)';
      params.push(`%${search}%`, `%${search}%`, isNaN(search) ? -1 : parseInt(search));
    }

    if (status && ['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    if (startDate) {
      whereClause += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }

    const query = `
      SELECT COUNT(*) AS total
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
    `;
    const [rows] = await pool.query(query, params);
    return rows[0].total;
  },

  async findById(id) {
    const query = `
      SELECT 
        o.id, 
        o.user_id, 
        u.name AS customer_name, 
        u.email AS customer_email,
        o.total_amount, 
        o.status, 
        o.created_at, 
        o.updated_at,
        p.payment_method,
        p.payment_status,
        p.created_at AS payment_date
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON p.order_id = o.id
      WHERE o.id = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  },

  async findOrderItems(orderId) {
    const query = `
      SELECT 
        oi.id, 
        oi.order_id, 
        oi.product_id, 
        p.name AS product_name, 
        c.name AS category_name,
        oi.quantity, 
        oi.price, 
        (oi.quantity * oi.price) AS subtotal
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE oi.order_id = ?
    `;
    const [rows] = await pool.query(query, [orderId]);
    return rows;
  },

  async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    // If order status is marked completed or cancelled, update payment accordingly if pending
    if (status === 'completed') {
      await pool.query(
        "UPDATE payments SET payment_status = 'completed' WHERE order_id = ? AND payment_status = 'pending'",
        [id]
      );
    } else if (status === 'cancelled') {
      await pool.query(
        "UPDATE payments SET payment_status = 'failed' WHERE order_id = ? AND payment_status = 'pending'",
        [id]
      );
    }

    return result.affectedRows > 0;
  },

  async findAllOrdersForExport({
    search = '',
    status = '',
    startDate = '',
    endDate = '',
    sortBy = 'created_at',
    sortOrder = 'DESC'
  }) {
    const params = [];
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ' AND (u.name LIKE ? OR u.email LIKE ? OR o.id = ?)';
      params.push(`%${search}%`, `%${search}%`, isNaN(search) ? -1 : parseInt(search));
    }

    if (status && ['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
      whereClause += ' AND o.status = ?';
      params.push(status);
    }

    if (startDate) {
      whereClause += ' AND DATE(o.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND DATE(o.created_at) <= ?';
      params.push(endDate);
    }

    const allowedSortFields = {
      id: 'o.id',
      total_amount: 'o.total_amount',
      status: 'o.status',
      created_at: 'o.created_at',
      customer: 'u.name'
    };

    const sortColumn = allowedSortFields[sortBy] || 'o.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        o.id, 
        u.name AS customer_name, 
        u.email AS customer_email,
        o.total_amount, 
        o.status, 
        p.payment_method,
        p.payment_status,
        o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN payments p ON p.order_id = o.id
      ${whereClause}
      ORDER BY ${sortColumn} ${safeSortOrder}
    `;

    const [rows] = await pool.query(query, params);
    return rows;
  }
};

module.exports = orderModel;
