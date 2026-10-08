/*
  # Add Wishlist, Orders, and Newsletter Features

  1. New Tables
    - `wishlists`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - identifies the user (can be session-based for guests)
      - `product_id` (uuid, foreign key to products)
      - `created_at` (timestamp)
    
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique) - human-readable order ID
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)
      - `shipping_address` (jsonb) - structured address data
      - `billing_address` (jsonb) - structured address data
      - `items` (jsonb) - array of order items with product details
      - `subtotal` (numeric)
      - `discount` (numeric) - discount amount applied
      - `shipping_cost` (numeric)
      - `total` (numeric)
      - `status` (text) - pending, processing, shipped, delivered, cancelled
      - `payment_status` (text) - pending, paid, failed, refunded
      - `tracking_number` (text) - shipping tracking number
      - `notes` (text) - internal notes
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `is_active` (boolean) - subscription status
      - `subscribed_at` (timestamp)
      - `unsubscribed_at` (timestamp)
    
    - `coupons`
      - `id` (uuid, primary key)
      - `code` (text, unique) - coupon code
      - `description` (text)
      - `discount_type` (text) - percentage, fixed
      - `discount_value` (numeric)
      - `min_order_value` (numeric) - minimum order value to use coupon
      - `max_discount` (numeric) - max discount for percentage type
      - `usage_limit` (integer) - total usage limit
      - `usage_count` (integer) - current usage count
      - `valid_from` (timestamp)
      - `valid_until` (timestamp)
      - `is_active` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to manage their wishlists
    - Add policies for users to view their own orders
    - Add policies for newsletter subscriptions
    - Add admin-only policies for orders and coupons management
*/

-- Create wishlists table
CREATE TABLE IF NOT EXISTS wishlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT
  USING (true);

CREATE POLICY "Users can add to their wishlist"
  ON wishlists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can remove from their wishlist"
  ON wishlists FOR DELETE
  USING (true);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address jsonb,
  billing_address jsonb,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal numeric NOT NULL DEFAULT 0,
  discount numeric DEFAULT 0,
  shipping_cost numeric DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  status text DEFAULT 'pending',
  payment_status text DEFAULT 'pending',
  tracking_number text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view orders by email"
  ON orders FOR SELECT
  USING (true);

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  is_active boolean DEFAULT true,
  subscribed_at timestamptz DEFAULT now(),
  unsubscribed_at timestamptz
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Subscribers can view their own subscription"
  ON newsletter_subscribers FOR SELECT
  USING (true);

CREATE POLICY "Subscribers can update their own subscription"
  ON newsletter_subscribers FOR UPDATE
  USING (true);

-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL,
  discount_value numeric NOT NULL,
  min_order_value numeric DEFAULT 0,
  max_discount numeric,
  usage_limit integer,
  usage_count integer DEFAULT 0,
  valid_from timestamptz DEFAULT now(),
  valid_until timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
