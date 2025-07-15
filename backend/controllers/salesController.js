const Sale = require('../models/Sale');
const SaleItem = require('../models/SaleItem');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

class SalesController {
  // Create a new sale (with items)
  static async createSale(req, res) {
    try {
      const { user_id, items, payment_method } = req.body; // items: [{product_id, quantity, price}]
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'No sale items provided' });
      }
      let total = 0;
      for (const item of items) {
        total += item.price * item.quantity;
      }
      const saleResult = await Sale.create({ user_id, total });
      if (!saleResult.success) return res.status(500).json(saleResult);
      const sale = saleResult.data[0];
      // Insert sale items and update product quantities
      for (const item of items) {
        await SaleItem.create({ sale_id: sale.id, product_id: item.product_id, quantity: item.quantity, price: item.price });
        // Decrement product quantity
        await Product.updateQuantity(item.product_id, -item.quantity);
      }
      // Audit log
      const actingUser = req.user ? req.user.id : null;
      await AuditLog.log({ user_id: actingUser, action: 'create_sale', details: JSON.stringify({ sale_id: sale.id, items, total, payment_method }) });
      res.status(201).json({ success: true, data: sale, message: 'Sale created successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get all sales
  static async getAllSales(req, res) {
    try {
      const result = await Sale.findAll();
      if (!result.success) return res.status(500).json(result);
      const sales = result.data;
      // For each sale, fetch its items and join with products to get product names
      const saleIds = sales.map(s => s.id);
      let itemsBySale = {};
      if (saleIds.length > 0) {
        // Get all sale items for these sales, joined with product name
        const { executeQuery } = require('../config/database');
        const itemsResult = await executeQuery(`
          SELECT si.*, p.name as product_name, p.part_number as product_part_number
          FROM sale_items si
          JOIN products p ON si.product_id = p.id
          WHERE si.sale_id = ANY($1)
        `, [saleIds]);
        if (itemsResult.success) {
          for (const item of itemsResult.data) {
            if (!itemsBySale[item.sale_id]) itemsBySale[item.sale_id] = [];
            itemsBySale[item.sale_id].push({
              id: item.id,
              product_id: item.product_id,
              name: item.product_name,
              part_number: item.product_part_number,
              quantity: item.quantity,
              price: item.price
            });
          }
        }
      }
      // Attach items to each sale, and remove user_id
      const salesWithItems = sales.map(({ user_id, ...sale }) => ({
        ...sale,
        items: itemsBySale[sale.id] || []
      }));
      res.json({ success: true, data: salesWithItems });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get sale by ID (with items)
  static async getSaleById(req, res) {
    try {
      const { id } = req.params;
      const saleResult = await Sale.findById(id);
      if (!saleResult.success || saleResult.rowCount === 0) {
        return res.status(404).json({ success: false, error: 'Sale not found' });
      }
      const { executeQuery } = require('../config/database');
      const itemsResult = await executeQuery(`
        SELECT si.*, p.name as product_name, p.part_number as product_part_number
        FROM sale_items si
        JOIN products p ON si.product_id = p.id
        WHERE si.sale_id = $1
      `, [id]);
      const items = (itemsResult.success ? itemsResult.data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        name: item.product_name,
        part_number: item.product_part_number,
        quantity: item.quantity,
        price: item.price
      })) : []);
      const { user_id, ...sale } = saleResult.data[0];
      res.json({ success: true, data: { ...sale, items } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = SalesController; 