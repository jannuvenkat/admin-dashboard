const dashboardService = require('../services/dashboardService');

const dashboardController = {
  // GET /api/dashboard/stats
  async getStats(req, res, next) {
    try {
      const stats = await dashboardService.getStats();
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = dashboardController;
