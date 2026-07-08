const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

async function initDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'heveanly_bakes',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Sherbi@15'
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        phone VARCHAR(30),
        role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        discount_percent NUMERIC(5,2) DEFAULT 0,
        discount_enabled BOOLEAN DEFAULT FALSE,
        is_trending BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY,
        cart_id UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        total_amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'PLACED',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY,
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price NUMERIC(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('DELETE FROM order_items;');
    await client.query('DELETE FROM orders;');
    await client.query('DELETE FROM cart_items;');
    await client.query('DELETE FROM cart;');
    await client.query('DELETE FROM products;');
    await client.query('DELETE FROM users;');

    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const customerPassword = await bcrypt.hash('Customer@123', 10);

    const adminId = uuidv4();
    const customerId = uuidv4();

    await client.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [adminId, 'Admin', 'User', 'admin@heavenlybakes.com', adminPassword, '0712345678', 'ADMIN']
    );

    await client.query(
      `INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [customerId, 'Customer', 'User', 'customer@heavenlybakes.com', customerPassword, '0712345679', 'CUSTOMER']
    );

    const product1Id = uuidv4();
    const product2Id = uuidv4();
    const product3Id = uuidv4();

    await client.query(
      `INSERT INTO products (id, name, description, price, stock, image_url, discount_percent, discount_enabled, is_trending)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [product1Id, 'Classic Vanilla Cake', 'Soft vanilla sponge with creamy frosting.', 24.99, 12, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 10, true, true]
    );

    await client.query(
      `INSERT INTO products (id, name, description, price, stock, image_url, discount_percent, discount_enabled, is_trending)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [product2Id, 'Chocolate Fudge Brownie', 'Rich brownie with molten chocolate center.', 8.5, 25, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52', 0, false, true]
    );

    await client.query(
      `INSERT INTO products (id, name, description, price, stock, image_url, discount_percent, discount_enabled, is_trending)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
      [product3Id, 'Berry Tart', 'Buttery tart filled with fresh berries.', 12.75, 8, 'https://images.unsplash.com/photo-1488477181946-6428a0291777', 5, true, false]
    );

    const cartId = uuidv4();
    const orderId = uuidv4();

    await client.query(`INSERT INTO cart (id, user_id) VALUES ($1, $2);`, [cartId, customerId]);
    await client.query(`INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES ($1, $2, $3, $4);`, [uuidv4(), cartId, product1Id, 2]);
    await client.query(`INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES ($1, $2, $3, $4);`, [uuidv4(), cartId, product2Id, 1]);

    await client.query(
      `INSERT INTO orders (id, user_id, total_amount, status) VALUES ($1, $2, $3, $4);`,
      [orderId, customerId, 42.99, 'PLACED']
    );

    await client.query(
      `INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4, $5);`,
      [uuidv4(), orderId, product1Id, 1, 24.99]
    );
    await client.query(
      `INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4, $5);`,
      [uuidv4(), orderId, product2Id, 1, 8.5]
    );

    await client.query('COMMIT');
    console.log('Database initialized successfully.');
    console.log('Seed users: admin@heavenlybakes.com / Admin@123');
    console.log('Seed users: customer@heavenlybakes.com / Customer@123');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase().catch((error) => {
  console.error('Database initialization failed:', error.message);
  process.exit(1);
});
