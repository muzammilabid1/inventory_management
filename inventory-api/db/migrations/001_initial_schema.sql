-- Initial schema for the inventory management app.
-- In pgAdmin, open the Query Tool for inventory_management_db before running this file.
-- The transaction makes sure all tables are created together or none are.
BEGIN;

-- One row represents one person who can sign in to the app.
CREATE TABLE users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- A category belongs to one user. Names only need to be unique within that user's inventory.
CREATE TABLE categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  name VARCHAR(120) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categories_user_name_unique UNIQUE (user_id, name),
  -- This pair lets products reference a category owned by the same user.
  CONSTRAINT categories_user_id_unique UNIQUE (user_id, id)
);

-- A product belongs to one user and one of that user's categories.
CREATE TABLE products (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  category_id BIGINT NOT NULL,
  name VARCHAR(160) NOT NULL,
  sku VARCHAR(80) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 10 CHECK (low_stock_threshold >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT products_user_sku_unique UNIQUE (user_id, sku),
  CONSTRAINT products_category_same_user_fk
    FOREIGN KEY (user_id, category_id)
    REFERENCES categories (user_id, id)
    ON DELETE RESTRICT
);

-- These indexes help the API find a user's categories and search their products by name.
CREATE INDEX categories_user_id_idx ON categories (user_id);
CREATE INDEX products_user_name_idx ON products (user_id, name);

-- Product status is derived from quantity and low_stock_threshold:
-- quantity = 0                  -> Out of Stock
-- quantity <= low_stock_threshold -> Low Stock
-- otherwise                     -> In Stock

COMMIT;
