const { executeQuery } = require('../config/database');

class Inventory {
  // Create inventory table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity DECIMAL(10,3) DEFAULT 0, -- in kg
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return await executeQuery(query);
  }

  // Create inventory_transactions table for tracking all movements
  static async createTransactionsTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS inventory_transactions (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        transaction_type VARCHAR(50) NOT NULL, -- 'IN', 'OUT', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT'
        quantity DECIMAL(10,3) NOT NULL,
        from_storage_site_id INTEGER REFERENCES storage_sites(id),
        to_storage_site_id INTEGER REFERENCES storage_sites(id),
        reference_number VARCHAR(100), -- PO number, invoice number, etc.
        notes TEXT,
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return await executeQuery(query);
  }

  // Get inventory for a product
  static async getByProductId(productId) {
    const query = `
      SELECT i.*, p.name as product_name, p.barcode, p.qr_code, p.unit
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.product_id = $1
    `;
    return await executeQuery(query, [productId]);
  }

  // Get all inventory with product details
  static async getAllWithProducts() {
    const query = `
      SELECT 
        i.*, 
        p.name as product_name, p.barcode, p.qr_code, p.unit,
        p.min_stock_level, p.max_stock_level,
        s.name as storage_site_name
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id
      ORDER BY p.name
    `;
    return await executeQuery(query);
  }

  // Add stock (IN transaction)
  static async addStock(productId, quantity, fromStorageSiteId = null, referenceNumber = null, notes = null, userId = null) {
    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Add transaction record
      const transactionQuery = `
        INSERT INTO inventory_transactions (
          product_id, transaction_type, quantity, from_storage_site_id, 
          reference_number, notes, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(transactionQuery, [
        productId, 'IN', quantity, fromStorageSiteId, referenceNumber, notes, userId
      ]);
      
      // Update inventory
      const inventoryQuery = `
        INSERT INTO inventory (product_id, quantity) 
        VALUES ($1, $2)
        ON CONFLICT (product_id) 
        DO UPDATE SET 
          quantity = inventory.quantity + $2,
          last_updated = NOW()
      `;
      await client.query(inventoryQuery, [productId, quantity]);
      
      await client.query('COMMIT');
      
      return { success: true, message: 'Stock added successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Remove stock (OUT transaction)
  static async removeStock(productId, quantity, toStorageSiteId = null, referenceNumber = null, notes = null, userId = null) {
    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check current stock
      const currentStockQuery = 'SELECT quantity FROM inventory WHERE product_id = $1';
      const currentStockResult = await client.query(currentStockQuery, [productId]);
      
      if (currentStockResult.rows.length === 0 || currentStockResult.rows[0].quantity < quantity) {
        throw new Error('Insufficient stock');
      }
      
      // Add transaction record
      const transactionQuery = `
        INSERT INTO inventory_transactions (
          product_id, transaction_type, quantity, to_storage_site_id, 
          reference_number, notes, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(transactionQuery, [
        productId, 'OUT', quantity, toStorageSiteId, referenceNumber, notes, userId
      ]);
      
      // Update inventory
      const inventoryQuery = `
        UPDATE inventory 
        SET quantity = quantity - $2, last_updated = NOW()
        WHERE product_id = $1
      `;
      await client.query(inventoryQuery, [productId, quantity]);
      
      await client.query('COMMIT');
      
      return { success: true, message: 'Stock removed successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Transfer stock between storage sites
  static async transferStock(productId, quantity, fromStorageSiteId, toStorageSiteId, referenceNumber = null, notes = null, userId = null) {
    const client = await require('../config/database').pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check current stock
      const currentStockQuery = 'SELECT quantity FROM inventory WHERE product_id = $1';
      const currentStockResult = await client.query(currentStockQuery, [productId]);
      
      if (currentStockResult.rows.length === 0 || currentStockResult.rows[0].quantity < quantity) {
        throw new Error('Insufficient stock for transfer');
      }
      
      // Add transfer out transaction
      const transferOutQuery = `
        INSERT INTO inventory_transactions (
          product_id, transaction_type, quantity, from_storage_site_id, 
          reference_number, notes, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(transferOutQuery, [
        productId, 'TRANSFER_OUT', quantity, fromStorageSiteId, referenceNumber, notes, userId
      ]);
      
      // Add transfer in transaction
      const transferInQuery = `
        INSERT INTO inventory_transactions (
          product_id, transaction_type, quantity, to_storage_site_id, 
          reference_number, notes, user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;
      await client.query(transferInQuery, [
        productId, 'TRANSFER_IN', quantity, toStorageSiteId, referenceNumber, notes, userId
      ]);
      
      // Update product storage site
      const updateProductQuery = `
        UPDATE products 
        SET storage_site_id = $2, updated_at = NOW()
        WHERE id = $1
      `;
      await client.query(updateProductQuery, [productId, toStorageSiteId]);
      
      await client.query('COMMIT');
      
      return { success: true, message: 'Stock transferred successfully' };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get transaction history for a product
  static async getTransactionHistory(productId, limit = 50) {
    const query = `
      SELECT 
        it.*,
        p.name as product_name,
        fs.name as from_storage_site_name,
        ts.name as to_storage_site_name,
        u.username as user_name
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.id
      LEFT JOIN storage_sites fs ON it.from_storage_site_id = fs.id
      LEFT JOIN storage_sites ts ON it.to_storage_site_id = ts.id
      LEFT JOIN users u ON it.user_id = u.id
      WHERE it.product_id = $1
      ORDER BY it.created_at DESC
      LIMIT $2
    `;
    return await executeQuery(query, [productId, limit]);
  }

  // Get low stock alerts
  static async getLowStockAlerts() {
    const query = `
      SELECT 
        i.*,
        p.name as product_name, p.barcode, p.qr_code, p.min_stock_level,
        s.name as storage_site_name,
        (p.min_stock_level - i.quantity) as shortage_amount
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id
      WHERE i.quantity <= p.min_stock_level
      ORDER BY shortage_amount DESC
    `;
    return await executeQuery(query);
  }

  // Get overstock alerts
  static async getOverstockAlerts() {
    const query = `
      SELECT 
        i.*,
        p.name as product_name, p.barcode, p.qr_code, p.max_stock_level,
        s.name as storage_site_name,
        (i.quantity - p.max_stock_level) as excess_amount
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id
      WHERE i.quantity > p.max_stock_level
      ORDER BY excess_amount DESC
    `;
    return await executeQuery(query);
  }

  // Scan product by barcode/QR
  static async scanProduct(identifier) {
    const query = `
      SELECT 
        p.*,
        i.quantity as current_stock,
        s.name as storage_site_name
      FROM products p
      LEFT JOIN inventory i ON p.id = i.product_id
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id
      WHERE p.barcode = $1 OR p.qr_code = $1
    `;
    return await executeQuery(query, [identifier]);
  }
}

module.exports = Inventory; 