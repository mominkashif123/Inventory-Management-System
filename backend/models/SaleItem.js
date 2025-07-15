const { executeQuery } = require('../config/database');

class SaleItem {
  // Create sale_items table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER REFERENCES sales(id),
        product_id INTEGER REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL
      )
    `;
    return await executeQuery(query);
  }

  // Create a new sale item
  static async create({ sale_id, product_id, quantity, price }) {
    const query = `
      INSERT INTO sale_items (sale_id, product_id, quantity, price)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    return await executeQuery(query, [sale_id, product_id, quantity, price]);
  }

  // Get all items for a sale
  static async findBySaleId(sale_id) {
    const query = 'SELECT * FROM sale_items WHERE sale_id = $1';
    return await executeQuery(query, [sale_id]);
  }
}

module.exports = SaleItem; 