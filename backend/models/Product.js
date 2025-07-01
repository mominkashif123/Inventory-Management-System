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
    const { name, description, quantity, value, part_number } = productData;
    const query = `
      INSERT INTO products (name, description, quantity, value, part_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    return await executeQuery(query, [name, description, quantity, value, part_number]);
  }

  // Update product
  static async update(id, productData) {
    const { name, description, quantity, value, part_number } = productData;
    const query = `
      UPDATE products SET
        name = $1,
        description = $2,
        quantity = $3,
        value = $4,
        part_number = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING *
    `;
    return await executeQuery(query, [name, description, quantity, value, part_number, id]);
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
}

module.exports = Product; 