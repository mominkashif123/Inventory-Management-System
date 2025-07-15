const { executeQuery } = require('../config/database');

class Product {
  // Create products table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        quantity DECIMAL(10,3) DEFAULT 0,
        value DECIMAL(10,2),
        part_number VARCHAR(100),
        type VARCHAR(50) NOT NULL DEFAULT 'accessories' CHECK (type IN ('accessories', 'merchandise', 'workshop')),
        location VARCHAR(255) DEFAULT 'warehouse' CHECK (location IN ('warehouse', 'store')),
        min_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return await executeQuery(query);
  }

  // Get all products
  static async findAll() {
    const query = 'SELECT * FROM products ORDER BY created_at DESC';
    return await executeQuery(query);
  }

  // Get product by ID
  static async findById(id) {
    const query = 'SELECT * FROM products WHERE id = $1';
    return await executeQuery(query, [id]);
  }

  // Create new product
  static async create(productData) {
    const { name, description, quantity, value, part_number, type = 'accessories', location = 'warehouse' } = productData;
    const query = `
      INSERT INTO products (name, description, quantity, value, part_number, type, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    return await executeQuery(query, [name, description, quantity, value, part_number, type, location]);
  }

  // Update product
  static async update(id, productData) {
    const { name, description, quantity, value, part_number, type = 'accessories', location = 'warehouse' } = productData;
    const query = `
      UPDATE products SET
        name = $1,
        description = $2,
        quantity = $3,
        value = $4,
        part_number = $5,
        type = $6,
        location = $7,
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
    return await executeQuery(query, [name, description, quantity, value, part_number, type, location, id]);
  }

  // Update product quantity by delta
  static async updateQuantity(id, delta) {
    const query = `
      UPDATE products SET quantity = quantity + $1, updated_at = NOW() WHERE id = $2 RETURNING *
    `;
    return await executeQuery(query, [delta, id]);
  }

  // Delete product
  static async delete(id) {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    return await executeQuery(query, [id]);
  }

  // Search products
  static async search(searchTerm) {
    const query = `
      SELECT * FROM products
      WHERE name ILIKE $1 OR description ILIKE $1 OR part_number ILIKE $1
      ORDER BY name
    `;
    return await executeQuery(query, [`%${searchTerm}%`]);
  }

  // Delete all products by type
  static async deleteByType(type) {
    const query = 'DELETE FROM products WHERE type = $1';
    return await executeQuery(query, [type]);
  }
}

module.exports = Product; 