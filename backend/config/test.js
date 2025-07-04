process.env.POSTGRES_CONNECTION_STRING = 'postgresql://postgres.hlikmlkuvjesandbdtfm:VI2ot4SyoilwL1rT@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

const Product = require('../models/Product');

async function deleteAllMerchandise() {
  const result = await Product.deleteByType('merchandise');
  console.log(`Deleted ${result.rowCount} merchandise products from the database.`);
}

deleteAllMerchandise();