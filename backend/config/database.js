const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.POSTGRES_CONNECTION_STRING;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  application_name: 'inventory-management-system'
});

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_database() as database_name');
    client.release();
    console.log('✅ Successfully connected to PostgreSQL database');
    console.log('📅 Database time:', result.rows[0].current_time);
    console.log('🗄️ Database name:', result.rows[0].database_name);
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    return false;
  }
}

function handleDatabaseError(error) {
  console.error('Database Error:', error);
  return {
    success: false,
    error: error.message,
    details: error.detail || null
  };
}

async function executeQuery(query, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return { success: true, data: result.rows, rowCount: result.rowCount };
  } catch (error) {
    return handleDatabaseError(error);
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  testConnection,
  handleDatabaseError,
  executeQuery
};
