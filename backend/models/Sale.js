const { executeQuery } = require('../config/database');

class Sale {
  // Create sales table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        total DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return await executeQuery(query);
  }

  // Create a new sale
  static async create({ user_id, total }) {
    const query = `
      INSERT INTO sales (user_id, total)
      VALUES ($1, $2)
      RETURNING *
    `;
    return await executeQuery(query, [user_id, total]);
  }

  // Get all sales
  static async findAll() {
    const query = 'SELECT * FROM sales ORDER BY created_at DESC';
    return await executeQuery(query);
  }

  // Get sale by ID
  static async findById(id) {
    const query = 'SELECT * FROM sales WHERE id = $1';
    return await executeQuery(query, [id]);
  }
}

module.exports = Sale; 