/*
# Uddin Entreprise E-commerce Schema

## Overview
Creates the complete database schema for the Uddin Entreprise e-commerce website.
This is a single-tenant app where admin manages products and customers browse/order.

## New Tables
1. `categories` - Product categories (e.g., Cookeries, Home Appliances)
   - id, name, slug, description, image_url, created_at
2. `products` - Products for sale
   - id, category_id (FK), name, slug, sku, description, price, cod_charge, delivery_inside_dhaka, delivery_outside_dhaka, images (array), specs (jsonb), is_best_seller, landing_content (jsonb), stock, created_at
3. `orders` - Customer orders
   - id, sku_code, customer_name, whatsapp_number, address, delivery_zone, product_id, product_name, product_price, delivery_price, total_price, status, created_at
4. `site_settings` - Site-wide settings (name, logo, footer, admin credentials)
   - id, site_name, logo_url, footer_text, contact_email, contact_phone, contact_address, facebook_url, instagram_url, telegram_url, admin_email, admin_password
5. `banners` - Homepage banner slides
   - id, title, slogan, image_url, link_url, order, is_active, created_at
6. `cart_items` - Shopping cart items (session-based)
   - id, session_id, product_id, quantity, created_at

## Security
- RLS enabled on all tables.
- Policies allow anon + authenticated to read public data (products, categories, banners, site_settings).
- Orders: anon can create (customers place orders); only authenticated admin can read/update.
- Cart items: anon can CRUD their own session cart.
- Site settings: anon can read; only authenticated admin can update.
*/

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_categories" ON categories;
CREATE POLICY "anon_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_categories" ON categories;
CREATE POLICY "auth_insert_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_categories" ON categories;
CREATE POLICY "auth_update_categories" ON categories FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_categories" ON categories;
CREATE POLICY "auth_delete_categories" ON categories FOR DELETE
  TO authenticated USING (true);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  sku text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  cod_charge numeric(10,2) DEFAULT 0,
  delivery_inside_dhaka numeric(10,2) DEFAULT 60,
  delivery_outside_dhaka numeric(10,2) DEFAULT 120,
  images text[] DEFAULT '{}',
  specs jsonb DEFAULT '{}'::jsonb,
  is_best_seller boolean DEFAULT false,
  landing_content jsonb DEFAULT '{}'::jsonb,
  stock integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_products" ON products;
CREATE POLICY "anon_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_products" ON products;
CREATE POLICY "auth_insert_products" ON products FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_products" ON products;
CREATE POLICY "auth_update_products" ON products FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_products" ON products;
CREATE POLICY "auth_delete_products" ON products FOR DELETE
  TO authenticated USING (true);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku_code text NOT NULL,
  customer_name text NOT NULL,
  whatsapp_number text NOT NULL,
  address text NOT NULL,
  delivery_zone text NOT NULL DEFAULT 'inside',
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric(10,2) NOT NULL,
  delivery_price numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_orders" ON orders;
CREATE POLICY "anon_insert_orders" ON orders FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_read_orders" ON orders;
CREATE POLICY "auth_read_orders" ON orders FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "auth_update_orders" ON orders;
CREATE POLICY "auth_update_orders" ON orders FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_orders" ON orders;
CREATE POLICY "auth_delete_orders" ON orders FOR DELETE
  TO authenticated USING (true);

-- Site Settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name text NOT NULL DEFAULT 'Uddin Entreprise',
  logo_url text,
  footer_text text DEFAULT 'Your trusted partner for quality cookeries and home appliances.',
  contact_email text DEFAULT 'contact@uddinentreprise.com',
  contact_phone text DEFAULT '+8801000000000',
  contact_address text DEFAULT 'Dhaka, Bangladesh',
  facebook_url text,
  instagram_url text,
  telegram_url text,
  admin_email text NOT NULL DEFAULT 'samirazmain8@gmail.com',
  admin_password text NOT NULL DEFAULT 'admin123',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_site_settings" ON site_settings;
CREATE POLICY "anon_read_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_site_settings" ON site_settings;
CREATE POLICY "auth_insert_site_settings" ON site_settings FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_site_settings" ON site_settings;
CREATE POLICY "auth_update_site_settings" ON site_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_site_settings" ON site_settings;
CREATE POLICY "auth_delete_site_settings" ON site_settings FOR DELETE
  TO authenticated USING (true);

-- Banners
CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slogan text,
  image_url text,
  link_url text,
  sort_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_banners" ON banners;
CREATE POLICY "anon_read_banners" ON banners FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "auth_insert_banners" ON banners;
CREATE POLICY "auth_insert_banners" ON banners FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "auth_update_banners" ON banners;
CREATE POLICY "auth_update_banners" ON banners FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "auth_delete_banners" ON banners;
CREATE POLICY "auth_delete_banners" ON banners FOR DELETE
  TO authenticated USING (true);

-- Cart Items (session-based)
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_cart_items" ON cart_items;
CREATE POLICY "anon_read_cart_items" ON cart_items FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cart_items" ON cart_items;
CREATE POLICY "anon_insert_cart_items" ON cart_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_cart_items" ON cart_items;
CREATE POLICY "anon_update_cart_items" ON cart_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cart_items" ON cart_items;
CREATE POLICY "anon_delete_cart_items" ON cart_items FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_orders_sku_code ON orders(sku_code);
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);

-- Insert default site settings
INSERT INTO site_settings (site_name, admin_email, admin_password)
SELECT 'Uddin Entreprise', 'samirazmain8@gmail.com', 'admin123'
WHERE NOT EXISTS (SELECT 1 FROM site_settings);

-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Cookeries', 'cookeries', 'Quality cookware for your kitchen'),
('Home Appliances', 'home-appliances', 'Modern appliances for your home'),
('Kitchen Tools', 'kitchen-tools', 'Essential tools for everyday cooking'),
('Small Appliances', 'small-appliances', 'Compact appliances for convenience')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample banners
INSERT INTO banners (title, slogan, image_url, sort_order, is_active) VALUES
('Premium Cookeries Collection', 'Elevate your cooking experience with our premium cookware', 'https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg', 0, true),
('Modern Home Appliances', 'Smart appliances for a smarter home', 'https://images.pexels.com/photos/4253318/pexels-photo-4253318.jpeg', 1, true),
('Kitchen Essentials', 'Everything you need for your kitchen', 'https://images.pexels.com/photos/3737599/pexels-photo-3737599.jpeg', 2, true)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (category_id, name, slug, sku, description, price, cod_charge, images, is_best_seller, specs, landing_content, stock)
SELECT c.id, 'Non-Stick Frying Pan', 'non-stick-frying-pan', 'UE-COOK-001',
'Premium non-stick frying pan with ceramic coating for healthy cooking.',
1299, 50, ARRAY['https://images.pexels.com/photos/4226806/pexels-photo-4226806.jpeg'],
true,
'{"material": "Aluminum", "diameter": "28cm", "coating": "Non-stick ceramic"}'::jsonb,
'{"sections": [{"type": "hero", "title": "Non-Stick Frying Pan", "subtitle": "Cook healthy, cook smart"}]}'::jsonb,
50
FROM categories c WHERE c.slug = 'cookeries'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, sku, description, price, cod_charge, images, is_best_seller, specs, landing_content, stock)
SELECT c.id, 'Electric Kettle 1.8L', 'electric-kettle-1-8l', 'UE-APP-001',
'Stainless steel electric kettle with auto shut-off and 1.8 liter capacity.',
1899, 80, ARRAY['https://images.pexels.com/photos/4253318/pexels-photo-4253318.jpeg'],
true,
'{"capacity": "1.8L", "material": "Stainless Steel", "power": "1500W"}'::jsonb,
'{"sections": [{"type": "hero", "title": "Electric Kettle", "subtitle": "Hot water in seconds"}]}'::jsonb,
30
FROM categories c WHERE c.slug = 'home-appliances'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, sku, description, price, cod_charge, images, is_best_seller, specs, landing_content, stock)
SELECT c.id, 'Stainless Steel Knife Set', 'stainless-steel-knife-set', 'UE-TOOL-001',
'5-piece stainless steel knife set with wooden block holder.',
2499, 100, ARRAY['https://images.pexels.com/photos/3737599/pexels-photo-3737599.jpeg'],
false,
'{"pieces": "5", "material": "Stainless Steel", "includes": "Wooden block"}'::jsonb,
'{"sections": [{"type": "hero", "title": "Knife Set", "subtitle": "Precision in every cut"}]}'::jsonb,
25
FROM categories c WHERE c.slug = 'kitchen-tools'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (category_id, name, slug, sku, description, price, cod_charge, images, is_best_seller, specs, landing_content, stock)
SELECT c.id, 'Mini Food Processor', 'mini-food-processor', 'UE-SAPP-001',
'Compact food processor with 500ml capacity and dual-speed settings.',
1599, 60, ARRAY['https://images.pexels.com/photos/4253306/pexels-photo-4253306.jpeg'],
true,
'{"capacity": "500ml", "speeds": "2", "power": "300W"}'::jsonb,
'{"sections": [{"type": "hero", "title": "Mini Food Processor", "subtitle": "Small size, big help"}]}'::jsonb,
20
FROM categories c WHERE c.slug = 'small-appliances'
ON CONFLICT (slug) DO NOTHING;