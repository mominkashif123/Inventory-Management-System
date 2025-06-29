const { executeQuery } = require('../config/database');

class Product {
  // Create products table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        barcode VARCHAR(100) UNIQUE,
        qr_code VARCHAR(100) UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        variant_type VARCHAR(100),
        weight_per_unit DECIMAL(10,3), -- kg
        unit VARCHAR(20) DEFAULT 'kg',
        price_per_unit DECIMAL(10,2),
        cost_per_unit DECIMAL(10,2),
        min_stock_level INTEGER DEFAULT 10,
        max_stock_level INTEGER DEFAULT 1000,
        is_imported BOOLEAN DEFAULT false,
        supplier_name VARCHAR(255),
        supplier_contact VARCHAR(255),
        storage_site_id INTEGER REFERENCES storage_sites(id),
        is_damaged BOOLEAN DEFAULT false,
        damage_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return await executeQuery(query);
  }

  // Get all products
  static async findAll() {
    const query = `
      SELECT p.*, s.name as storage_site_name 
      FROM products p 
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id 
      ORDER BY p.created_at DESC
    `;
    return await executeQuery(query);
  }

  // Get product by ID
  static async findById(id) {
    const query = `
      SELECT p.*, s.name as storage_site_name 
      FROM products p 
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id 
      WHERE p.id = $1
    `;
    return await executeQuery(query, [id]);
  }

  // Get product by barcode
  static async findByBarcode(barcode) {
    const query = `
      SELECT p.*, s.name as storage_site_name 
      FROM products p 
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id 
      WHERE p.barcode = $1
    `;
    return await executeQuery(query, [barcode]);
  }

  // Get product by QR code
  static async findByQRCode(qrCode) {
    const query = `
      SELECT p.*, s.name as storage_site_name 
      FROM products p 
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id 
      WHERE p.qr_code = $1
    `;
    return await executeQuery(query, [qrCode]);
  }

  // Create new product
  static async create(productData) {
    const {
      barcode, qr_code, name, description, category, variant_type,
      weight_per_unit, unit, price_per_unit, cost_per_unit,
      min_stock_level, max_stock_level, is_imported,
      supplier_name, supplier_contact, storage_site_id
    } = productData;

    const query = `
      INSERT INTO products (
        barcode, qr_code, name, description, category, variant_type,
        weight_per_unit, unit, price_per_unit, cost_per_unit,
        min_stock_level, max_stock_level, is_imported,
        supplier_name, supplier_contact, storage_site_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *
    `;
    
    return await executeQuery(query, [
      barcode, qr_code, name, description, category, variant_type,
      weight_per_unit, unit, price_per_unit, cost_per_unit,
      min_stock_level, max_stock_level, is_imported,
      supplier_name, supplier_contact, storage_site_id
    ]);
  }

  // Update product
  static async update(id, productData) {
    const {
      barcode, qr_code, name, description, category, variant_type,
      weight_per_unit, unit, price_per_unit, cost_per_unit,
      min_stock_level, max_stock_level, is_imported,
      supplier_name, supplier_contact, storage_site_id,
      is_damaged, damage_notes
    } = productData;

    const query = `
      UPDATE products SET 
        barcode = $1, qr_code = $2, name = $3, description = $4, 
        category = $5, variant_type = $6, weight_per_unit = $7, 
        unit = $8, price_per_unit = $9, cost_per_unit = $10,
        min_stock_level = $11, max_stock_level = $12, is_imported = $13,
        supplier_name = $14, supplier_contact = $15, storage_site_id = $16,
        is_damaged = $17, damage_notes = $18, updated_at = NOW()
      WHERE id = $19
      RETURNING *
    `;
    
    return await executeQuery(query, [
      barcode, qr_code, name, description, category, variant_type,
      weight_per_unit, unit, price_per_unit, cost_per_unit,
      min_stock_level, max_stock_level, is_imported,
      supplier_name, supplier_contact, storage_site_id,
      is_damaged, damage_notes, id
    ]);
  }

  // Delete product
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    return await executeQuery(query, [id]);
  }

  // Get low stock products
  static async getLowStockProducts() {
    const query = `
      SELECT p.*, s.name as storage_site_name,
             (p.min_stock_level - COALESCE(i.quantity, 0)) as shortage_amount
      FROM products p 
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE COALESCE(i.quantity, 0) <= p.min_stock_level
      ORDER BY shortage_amount DESC
    `;
    return await executeQuery(query);
  }

  // Get overstock products
  static async getOverstockProducts() {
    const query = `
      SELECT p.*, s.name as storage_site_name,
             (COALESCE(i.quantity, 0) - p.max_stock_level) as excess_amount
      FROM products p 
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id
      LEFT JOIN inventory i ON p.id = i.product_id
      WHERE COALESCE(i.quantity, 0) > p.max_stock_level
      ORDER BY excess_amount DESC
    `;
    return await executeQuery(query);
  }

  // Get damaged products
  static async getDamagedProducts() {
    const query = `
      SELECT p.*, s.name as storage_site_name 
      FROM products p 
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id 
      WHERE p.is_damaged = true
      ORDER BY p.updated_at DESC
    `;
    return await executeQuery(query);
  }

  // Search products
  static async search(searchTerm) {
    const query = `
      SELECT p.*, s.name as storage_site_name 
      FROM products p 
      LEFT JOIN storage_sites s ON p.storage_site_id = s.id 
      WHERE p.name ILIKE $1 OR p.description ILIKE $1 OR p.category ILIKE $1
      OR p.barcode ILIKE $1 OR p.qr_code ILIKE $1
      ORDER BY p.name
    `;
    return await executeQuery(query, [`%${searchTerm}%`]);
  }
}

module.exports = Product; 