import api from './api';

const userService = {
  async getUsers(params = {}) {
    const res = await api.get('/users', { params });
    return {
      users: res.data,
      pagination: res.pagination
    };
  },

  async getUserById(id) {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },

  async createUser(userData) {
    const res = await api.post('/users', userData);
    return res.data;
  },

  async updateUser(id, userData) {
    const res = await api.put(`/users/${id}`, userData);
    return res.data;
  },

  async deleteUser(id) {
    const res = await api.delete(`/users/${id}`);
    return res;
  }
};

export default userService;
