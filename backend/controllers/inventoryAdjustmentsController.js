const InventoryAdjustment = require('../models/InventoryAdjustment');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

class InventoryAdjustmentsController {
  // Create a new inventory adjustment
  static async createAdjustment(req, res) {
    try {
      const { product_id, user_id, change, reason } = req.body;
      if (!product_id || !user_id || !change) {
        return res.status(400).json({ success: false, error: 'Missing required fields' });
      }
      // Update product quantity
      await Product.updateQuantity(product_id, change);
      // Log adjustment
      const result = await InventoryAdjustment.create({ product_id, user_id, change, reason });
      if (!result.success) return res.status(500).json(result);
      // Audit log
      const actingUser = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: actingUser, action: 'inventory_adjustment', details: JSON.stringify({ product_id, change, reason }) });
      res.status(201).json({ success: true, data: result.data[0], message: 'Inventory adjusted' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get all adjustments
  static async getAllAdjustments(req, res) {
    try {
      const result = await InventoryAdjustment.findAll();
      if (!result.success) return res.status(500).json(result);
      res.json({ success: true, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get adjustments for a product
  static async getAdjustmentsByProduct(req, res) {
    try {
      const { product_id } = req.params;
      const result = await InventoryAdjustment.findByProductId(product_id);
      if (!result.success) return res.status(500).json(result);
      res.json({ success: true, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = InventoryAdjustmentsController; 