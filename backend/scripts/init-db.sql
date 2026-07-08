CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
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

CREATE TABLE products (
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

CREATE TABLE cart (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cart_items (
  id UUID PRIMARY KEY,
  cart_id UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PLACED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (id, first_name, last_name, email, password_hash, phone, role)
VALUES
  (gen_random_uuid(), 'Admin', 'User', 'admin@heavenlybakes.com', '$2b$10$0r8j3O2zv2mJ8Nd5TPxqJeWMuD3h0v6E7YaXUQmpbQjK2o7ywrQ1i', '0712345678', 'ADMIN'),
  (gen_random_uuid(), 'Customer', 'User', 'customer@heavenlybakes.com', '$2b$10$8uQ1p9Svi7p/7rl8v4d3zO7r6N8mQvMreW2xLgfJ9K2W6O4z6p0sO', '0712345679', 'CUSTOMER');

INSERT INTO products (id, name, description, price, stock, image_url, discount_percent, discount_enabled, is_trending)
VALUES
  (gen_random_uuid(), 'Classic Vanilla Cake', 'Soft vanilla sponge with creamy frosting.', 24.99, 12, 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e', 10, true, true),
  (gen_random_uuid(), 'Chocolate Fudge Brownie', 'Rich brownie with molten chocolate center.', 8.50, 25, 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52', 0, false, true),
  (gen_random_uuid(), 'Berry Tart', 'Buttery tart filled with fresh berries.', 12.75, 8, 'https://images.unsplash.com/photo-1488477181946-6428a0291777', 5, true, false);
