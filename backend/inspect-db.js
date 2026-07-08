const { Pool } = require('pg');
require('dotenv').config();
(async () => {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'heveanly_bakes',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Sherbi@15'
  });

  const carts = await pool.query('SELECT * FROM cart ORDER BY id');
  console.log('CARTS');
  console.log(JSON.stringify(carts.rows, null, 2));

  const cartItems = await pool.query('SELECT * FROM cart_items ORDER BY id');
  console.log('CART_ITEMS');
  console.log(JSON.stringify(cartItems.rows, null, 2));

  await pool.end();
})().catch(err => { console.error(err); process.exit(1); });
