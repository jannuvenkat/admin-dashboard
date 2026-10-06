import axios from 'axios';
import api from './api';

const orderService = {
  async getOrders(params = {}) {
    const res = await api.get('/orders', { params });
    return {
      orders: res.data,
      pagination: res.pagination
    };
  },

  async getOrderById(id) {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  async updateOrderStatus(id, status) {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  },

  async exportOrders(params = {}) {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`${baseURL}/orders/export`, {
        params,
        responseType: 'blob',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        }
      });

      // Extract filename from Content-Disposition header if present
      let filename = `orders_${new Date().toISOString().split('T')[0]}.xlsx`;
      const disposition = response.headers['content-disposition'];
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename="?([^";]+)"?/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      }

      return {
        blob: response.data,
        filename
      };
    } catch (error) {
      let errorMessage = 'Unable to export orders. Please try again.';

      if (error.response?.data instanceof Blob) {
        try {
          const text = await error.response.data.text();
          const parsed = JSON.parse(text);
          if (parsed.message) {
            errorMessage = parsed.message;
          }
        } catch {
          // Keep default error message
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  }
};

export default orderService;
