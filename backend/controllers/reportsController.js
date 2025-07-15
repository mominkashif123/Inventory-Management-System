const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const { executeQuery } = require('../config/database');

class ReportsController {
  // Sales summary: total sales, total revenue
  static async salesSummary(req, res) {
    try {
      const result = await executeQuery('SELECT COUNT(*) AS total_sales, COALESCE(SUM(total),0) AS total_revenue FROM sales');
      res.json({ success: true, data: result.data[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Inventory value: sum of (quantity * value) for all products
  static async inventoryValue(req, res) {
    try {
      const result = await executeQuery('SELECT COALESCE(SUM(quantity * value),0) AS inventory_value FROM products');
      res.json({ success: true, data: result.data[0] });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Bestsellers: top 10 products by quantity sold
  static async bestsellers(req, res) {
    try {
      const result = await executeQuery(`
        SELECT p.id, p.name, SUM(si.quantity) AS total_sold
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        GROUP BY p.id, p.name
        ORDER BY total_sold DESC
        LIMIT 10
      `);
      res.json({ success: true, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Low-stock products: quantity <= 1
  static async lowStockProducts(req, res) {
    try {
      const result = await executeQuery('SELECT * FROM products WHERE quantity <= 1');
      res.json({ success: true, data: result.data });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = ReportsController; 