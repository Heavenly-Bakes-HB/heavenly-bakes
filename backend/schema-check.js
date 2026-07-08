const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'heveanly_bakes',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Sherbi@15'
});
(async () => {
  const tables = ['products','orders','order_items','users'];
  for (const table of tables) {
    const res = await pool.query(
      `SELECT column_name,data_type FROM information_schema.columns WHERE table_name=$1 ORDER BY ordinal_position`,
      [table]
    );
    console.log(table.toUpperCase());
    console.log(JSON.stringify(res.rows, null, 2));
  }
  await pool.end();
})().catch(err => { console.error(err); process.exit(1); });
