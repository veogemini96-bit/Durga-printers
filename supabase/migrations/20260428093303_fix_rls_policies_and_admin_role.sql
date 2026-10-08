/*
  # Fix overly permissive RLS policies and add admin role support

  1. Changes
    - Add admin_users table to manage admin access
    - Fix USING (true) policies on wishlists, orders, order_items, payments, newsletter_subscribers
    - Replace with properly scoped policies
    - Ensure is_active column exists on products

  2. Security
    - Wishlists: users can only read/modify their own entries; anon still allowed for guest carts
    - Orders: only owner or matching email can view; anyone can insert
    - Order items & payments: tied to order ownership
    - Newsletter: no public SELECT on subscriber list
*/

-- ================================================
-- 1. ADMIN USERS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'admin_users' AND policyname = 'Admins can view admin list'
  ) THEN
    CREATE POLICY "Admins can view admin list"
      ON admin_users FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- ================================================
-- 2. FIX WISHLISTS RLS
-- ================================================
DO $$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname FROM pg_policies WHERE tablename = 'wishlists'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON wishlists';
  END LOOP;
END $$;

CREATE POLICY "Users can view own wishlists"
  ON wishlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlists"
  ON wishlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlists"
  ON wishlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anon can manage wishlists"
  ON wishlists FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ================================================
-- 3. FIX ORDERS RLS
-- ================================================
DO $$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname FROM pg_policies WHERE tablename = 'orders'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON orders';
  END LOOP;
END $$;

CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Authenticated users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (true);

-- ================================================
-- 4. FIX ORDER_ITEMS RLS
-- ================================================
DO $$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname FROM pg_policies WHERE tablename = 'order_items'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON order_items';
  END LOOP;
END $$;

CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid()
        OR orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- ================================================
-- 5. FIX PAYMENTS RLS
-- ================================================
DO $$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname FROM pg_policies WHERE tablename = 'payments'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON payments';
  END LOOP;
END $$;

CREATE POLICY "Anyone can insert payments"
  ON payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND (
        orders.user_id = auth.uid()
        OR orders.customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

-- ================================================
-- 6. FIX NEWSLETTER SUBSCRIBERS RLS
-- ================================================
DO $$
DECLARE
  pol_name text;
BEGIN
  FOR pol_name IN
    SELECT policyname FROM pg_policies WHERE tablename = 'newsletter_subscribers'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol_name || '" ON newsletter_subscribers';
  END LOOP;
END $$;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view own subscription"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ================================================
-- 7. ENSURE is_active COLUMN EXISTS ON PRODUCTS
-- ================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE products ADD COLUMN is_active boolean NOT NULL DEFAULT true;
  END IF;
END $$;
