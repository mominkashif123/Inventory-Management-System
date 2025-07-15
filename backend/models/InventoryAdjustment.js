const { executeQuery } = require('../config/database');

class InventoryAdjustment {
  // Create inventory_adjustments table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS inventory_adjustments (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        user_id INTEGER REFERENCES users(id),
        change INTEGER NOT NULL,
        reason VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return await executeQuery(query);
  }

  // Create a new adjustment
  static async create({ product_id, user_id, change, reason }) {
    const query = `
      INSERT INTO inventory_adjustments (product_id, user_id, change, reason)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    return await executeQuery(query, [product_id, user_id, change, reason]);
  }

  // Get all adjustments
  static async findAll() {
    const query = 'SELECT * FROM inventory_adjustments ORDER BY created_at DESC';
    return await executeQuery(query);
  }

  // Get adjustments for a product
  static async findByProductId(product_id) {
    const query = 'SELECT * FROM inventory_adjustments WHERE product_id = $1 ORDER BY created_at DESC';
    return await executeQuery(query, [product_id]);
  }
}

module.exports = InventoryAdjustment; 