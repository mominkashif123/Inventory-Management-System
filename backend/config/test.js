const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: 'postgresql://postgres.hlikmlkuvjesandbdtfm:VI2ot4SyoilwL1rT@aws-0-ap-south-1.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function dropProductsTable() {
  try {
    await pool.query('DROP TABLE IF EXISTS products');
    console.log('✅ Dropped products table');
  } catch (err) {
    console.error('❌ Error dropping products table:', err);
  } finally {
    await pool.end();
  }
}

dropProductsTable();