import api from './api';

const analyticsService = {
  async getRevenueAnalytics(params = {}) {
    const res = await api.get('/analytics/revenue', { params });
    return res.data;
  },

  async getUserAnalytics(params = {}) {
    const res = await api.get('/analytics/users', { params });
    return res.data;
  },

  async getOrderAnalytics(params = {}) {
    const res = await api.get('/analytics/orders', { params });
    return res.data;
  },

  async getProductAnalytics() {
    const res = await api.get('/analytics/products');
    return res.data;
  }
};

export default analyticsService;
