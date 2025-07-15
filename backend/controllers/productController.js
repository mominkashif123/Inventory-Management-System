const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

class ProductController {
  // Get all products
  static async getAllProducts(req, res) {
    try {
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
      const { name, description, quantity, value, part_number, type = 'accessories', location = 'warehouse' } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'Product name is required' });
      const result = await Product.create({ name, description, quantity, value, part_number, type, location });
      if (!result.success) return res.status(400).json(result);
      // Audit log
      const userId = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: userId, action: 'create_product', details: JSON.stringify({ name, part_number, type, location }) });
      res.status(201).json({ success: true, data: result.data[0], message: 'Product created successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update product
  static async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const { name, description, quantity, value, part_number, type, location } = req.body;
      const result = await Product.update(id, { name, description, quantity, value, part_number, type, location });
      if (!result.success) return res.status(400).json(result);
      // Audit log
      const userId = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: userId, action: 'update_product', details: JSON.stringify({ id, name, part_number, type, location }) });
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