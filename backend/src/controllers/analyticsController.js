const analyticsService = require('../services/analyticsService');

const analyticsController = {
  // GET /api/analytics/revenue
  async getRevenueAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getRevenueAnalytics(req.query);
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/analytics/users
  async getUserAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getUserAnalytics(req.query);
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/analytics/orders
  async getOrderAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getOrderAnalytics(req.query);
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/analytics/products
  async getProductAnalytics(req, res, next) {
    try {
      const data = await analyticsService.getProductAnalytics();
      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = analyticsController;
