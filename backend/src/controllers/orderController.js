const orderService = require('../services/orderService');

const orderController = {
  // GET /api/orders
  async getOrders(req, res, next) {
    try {
      const result = await orderService.getAllOrders(req.query);
      return res.status(200).json({
        success: true,
        data: result.orders,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/orders/:id
  async getOrderById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      return res.status(200).json({
        success: true,
        data: order
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // PUT /api/orders/:id/status
  async updateOrderStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Status is required'
        });
      }

      const updatedOrder = await orderService.updateOrderStatus(req.params.id, status);
      return res.status(200).json({
        success: true,
        data: updatedOrder
      });
    } catch (error) {
      if (error.message === 'Order not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('Invalid status')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // GET /api/orders/export
  async exportOrders(req, res, next) {
    try {
      const { count, buffer, filename } = await orderService.exportOrders(req.query);

      if (count === 0 || !buffer) {
        return res.status(404).json({
          success: false,
          message: 'No orders found for the selected filters.'
        });
      }

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = orderController;
