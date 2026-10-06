import api from './api';

const productService = {
  async getProducts(params = {}) {
    const res = await api.get('/products', { params });
    return {
      products: res.data,
      pagination: res.pagination
    };
  },

  async getCategories() {
    const res = await api.get('/products/categories');
    return res.data;
  },

  async getProductById(id) {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  async createProduct(productData) {
    const res = await api.post('/products', productData);
    return res.data;
  },

  async updateProduct(id, productData) {
    const res = await api.put(`/products/${id}`, productData);
    return res.data;
  },

  async deleteProduct(id) {
    const res = await api.delete(`/products/${id}`);
    return res;
  }
};

export default productService;
