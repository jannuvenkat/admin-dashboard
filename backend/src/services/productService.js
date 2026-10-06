const productModel = require('../models/productModel');
const categoryModel = require('../models/categoryModel');

const productService = {
  async getAllProducts(params) {
    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;
    const search = params.search || '';
    const category = params.category || '';
    const stock = params.stock || '';
    const status = params.status || '';
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'DESC';

    const products = await productModel.findProducts({
      page,
      limit,
      search,
      category,
      stock,
      status,
      sortBy,
      sortOrder
    });

    const total = await productModel.countProducts({ search, category, stock, status });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  async getProductById(id) {
    const product = await productModel.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  },

  async createProduct(productData) {
    const { name, category_id, price, stock, status } = productData;

    const category = await categoryModel.findById(category_id);
    if (!category) {
      throw new Error('Invalid category ID');
    }

    const newProductId = await productModel.createProduct({
      name,
      category_id: parseInt(category_id),
      price: parseFloat(price),
      stock: parseInt(stock, 10) || 0,
      status: status || 'active'
    });

    return await productModel.findById(newProductId);
  },

  async updateProduct(id, updateData) {
    const product = await productModel.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }

    if (updateData.category_id) {
      const category = await categoryModel.findById(updateData.category_id);
      if (!category) {
        throw new Error('Invalid category ID');
      }
    }

    await productModel.updateProduct(id, updateData);
    return await productModel.findById(id);
  },

  async deleteProduct(id) {
    const product = await productModel.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    await productModel.deleteProduct(id);
    return true;
  },

  async getCategories() {
    return await categoryModel.getAll();
  }
};

module.exports = productService;
