const productService = require('../services/productService');

const productController = {
  // GET /api/products
  async getProducts(req, res, next) {
    try {
      const result = await productService.getAllProducts(req.query);
      return res.status(200).json({
        success: true,
        data: result.products,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/products/categories
  async getCategories(req, res, next) {
    try {
      const categories = await productService.getCategories();
      return res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/products/:id
  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);
      return res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // POST /api/products
  async createProduct(req, res, next) {
    try {
      const { name, category_id, price } = req.body;
      if (!name || !category_id || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Product name, category ID, and price are required'
        });
      }

      const newProduct = await productService.createProduct(req.body);
      return res.status(201).json({
        success: true,
        data: newProduct
      });
    } catch (error) {
      if (error.message.includes('Invalid category')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // PUT /api/products/:id
  async updateProduct(req, res, next) {
    try {
      const updatedProduct = await productService.updateProduct(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        data: updatedProduct
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      if (error.message.includes('Invalid category')) {
        return res.status(400).json({ success: false, message: error.message });
      }
      next(error);
    }
  },

  // DELETE /api/products/:id
  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.params.id);
      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
      });
    } catch (error) {
      if (error.message === 'Product not found') {
        return res.status(404).json({ success: false, message: error.message });
      }
      next(error);
    }
  }
};

module.exports = productController;
