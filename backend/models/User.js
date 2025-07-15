const { executeQuery } = require('../config/database');

class User {
  // Create users table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return await executeQuery(query);
  }

  // Find user by username
  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    return await executeQuery(query, [username]);
  }

  // Create new user
  static async create({ username, password_hash, role }) {
    const query = `
      INSERT INTO users (username, password_hash, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    return await executeQuery(query, [username, password_hash, role || 'admin']);
  }

  // Get all users
  static async findAll() {
    const query = 'SELECT id, username, role, created_at, updated_at FROM users ORDER BY created_at DESC';
    return await executeQuery(query);
  }

  // Update user role
  static async updateRole(id, role) {
    const query = `
      UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *
    `;
    return await executeQuery(query, [role, id]);
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING *';
    return await executeQuery(query, [id]);
  }

  // Check if user has a specific role
  static hasRole(user, role) {
    return user.role === role;
  }
}

module.exports = User; 