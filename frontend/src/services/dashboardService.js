import api from './api';

const dashboardService = {
  async getStats() {
    const res = await api.get('/dashboard/stats');
    return res.data;
  }
};

export default dashboardService;
