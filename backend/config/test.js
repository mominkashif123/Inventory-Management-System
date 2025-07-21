process.env.POSTGRES_CONNECTION_STRING = 'postgresql://postgres.hlikmlkuvjesandbdtfm:VI2ot4SyoilwL1rT@aws-0-ap-south-1.pooler.supabase.com:5432/postgres';

const { executeQuery } = require('./database');

// async function resetSalesTable() {
//   await executeQuery('DROP TABLE IF EXISTS sales CASCADE');
//   await executeQuery(`
//     CREATE TABLE sales (
//       id SERIAL PRIMARY KEY,
//       user_id INTEGER REFERENCES users(id),
//       total DECIMAL(10,2) NOT NULL,
//       customer_name VARCHAR(255),
//       customer_email VARCHAR(255),
//       customer_number VARCHAR(50),
//       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
//     )
//   `);
//   console.log('Dropped and recreated sales table.');
// }

async function updateAuditLogsConstraint() {
  // Drop and recreate the foreign key constraint with ON DELETE SET NULL
  await executeQuery('ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey');
  await executeQuery(`
    ALTER TABLE audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  `);
  console.log('Updated audit_logs.user_id foreign key to ON DELETE SET NULL.');
}

async function main() {
  // await resetSalesTable();
  await updateAuditLogsConstraint();
}

main();