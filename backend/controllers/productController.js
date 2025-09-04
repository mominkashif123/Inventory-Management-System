const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

class ProductController {
  // Get all products
  static async getAllProducts(req, res) {
    try {
      const page = req.query.page ? parseInt(req.query.page, 10) : null;
      const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

      if (page && limit) {
        const offset = (page - 1) * limit;
        const countResult = await Product.countAll();
        if (!countResult.success) return res.status(500).json(countResult);
        const total = Number(countResult.data[0].count || 0);
        const dataResult = await Product.findAllPaginated({ limit, offset });
        if (!dataResult.success) return res.status(500).json(dataResult);
        const totalPages = Math.ceil(total / limit);
        return res.json({ success: true, data: dataResult.data, count: total, page, totalPages });
      }

      const result = await Product.findAll();
      if (!result.success) return res.status(500).json(result);
      res.json({ success: true, data: result.data, count: result.rowCount });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get product by ID
  static async getProductById(req, res) {
    try {
      const { id } = req.params;
      const result = await Product.findById(id); 
      if (!result.success) return res.status(500).json(result);
      if (result.rowCount === 0) return res.status(404).json({ success: false, error: 'Product not found' });
      res.json({ success: true, data: result.data[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Create new product
  static async createProduct(req, res) {
    try {
      const { name, description, quantity, value, currency = 'USD', part_number, type = 'accessories', location = 'warehouse' } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'Product name is required' });
      
      // Validate currency
      if (currency && !['USD', 'PKR'].includes(currency)) {
        return res.status(400).json({ success: false, error: 'Currency must be either USD or PKR' });
      }
      
      const result = await Product.create({ name, description, quantity, value, currency, part_number, type, location });
      if (!result.success) return res.status(400).json(result);
      // Audit log
      const userId = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: userId, action: 'create_product', details: JSON.stringify({ name, part_number, type, location, currency }) });
      res.status(201).json({ success: true, data: result.data[0], message: 'Product created successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, quantity, value, currency = 'USD', part_number, type, location } = req.body;
      
      // Validate currency
      if (currency && !['USD', 'PKR'].includes(currency)) {
        return res.status(400).json({ success: false, error: 'Currency must be either USD or PKR' });
      }
      
      const result = await Product.update(id, { name, description, quantity, value, currency, part_number, type, location });
      if (!result.success) return res.status(400).json(result);
      // Audit log
      const userId = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: userId, action: 'update_product', details: JSON.stringify({ id, name, part_number, type, location, currency }) });
      res.json({ success: true, data: result.data[0], message: 'Product updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete product
  static async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const result = await Product.delete(id);
      if (!result.success) return res.status(400).json(result);
      // Audit log
      const userId = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: userId, action: 'delete_product', details: JSON.stringify({ id }) });
      res.json({ success: true, data: result.data[0], message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Search products
  static async searchProducts(req, res) {
    try {
      const { q } = req.query;
      if (!q) return res.status(400).json({ success: false, error: 'Search query is required' });
      const result = await Product.search(q);
      if (!result.success) return res.status(500).json(result);
      res.json({ success: true, data: result.data, count: result.rowCount });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ProductController; 