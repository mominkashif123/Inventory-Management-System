const { executeQuery } = require('../config/database');

class AuditLog {
  // Create audit_logs table if it doesn't exist
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    return await executeQuery(query);
  }

  // Log an action
  static async log({ user_id, action, details }) {
    const query = `
      INSERT INTO audit_logs (user_id, action, details)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    return await executeQuery(query, [user_id, action, details]);
  }

  // Get all logs
  static async findAll() {
    const query = 'SELECT * FROM audit_logs ORDER BY created_at DESC';
    return await executeQuery(query);
  }
}

module.exports = AuditLog; 