/*
  # Fix "permission denied for table users"

  ## Problem
  Multiple RLS policies on orders, order_items, and payments reference `auth.users`
  in a subquery: `customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())`.
  Neither the `anon` nor `authenticated` role has SELECT permission on `auth.users`,
  so every query against these tables fails with "permission denied for table users".

  ## Fix
  1. Remove all `auth.users` subqueries from RLS policies.
  2. For authenticated users: use `auth.uid() = user_id` only (no email lookup).
  3. For anon users: scope SELECT to guest orders (user_id IS NULL) so guest order
     tracking works without exposing authenticated users' orders.
  4. Apply the same pattern to order_items and payments (scope through parent order).
  5. Simplify the newsletter_subscribers SELECT policy to use auth.jwt() email claim
     instead of querying auth.users.
*/

-- ================================================
-- 1. FIX ORDERS POLICIES
-- ================================================
DROP POLICY IF EXISTS "Authenticated users can view own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update own orders" ON orders;
DROP POLICY IF EXISTS "Anon can view orders by number and email" ON orders;

-- Authenticated SELECT: user sees own orders + admins see all
CREATE POLICY "Authenticated users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Anon SELECT: guest orders only (user_id IS NULL)
CREATE POLICY "Anon can view guest orders"
  ON orders FOR SELECT
  TO anon
  USING (user_id IS NULL);

-- Authenticated UPDATE: user updates own orders only
CREATE POLICY "Authenticated users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can update all orders (already exists, keep it)
-- "Admins can update all orders" — no change needed

-- ================================================
-- 2. FIX ORDER_ITEMS POLICIES
-- ================================================
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Anon can view order items by order lookup" ON order_items;

-- Authenticated SELECT: own orders + admin orders
CREATE POLICY "Authenticated users can view own order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        orders.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
      )
    )
  );

-- Anon SELECT: guest order items only
CREATE POLICY "Anon can view guest order items"
  ON order_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id IS NULL
    )
  );

-- ================================================
-- 3. FIX PAYMENTS POLICIES
-- ================================================
DROP POLICY IF EXISTS "Users can view own payments" ON payments;
DROP POLICY IF EXISTS "Anon can view payments by order lookup" ON payments;

-- Authenticated SELECT: own payments + admin payments
CREATE POLICY "Authenticated users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND (
        orders.user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
      )
    )
  );

-- Anon SELECT: guest order payments only
CREATE POLICY "Anon can view guest payments"
  ON payments FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.user_id IS NULL
    )
  );

-- ================================================
-- 4. FIX NEWSLETTER_SUBSCRIBERS POLICY
-- ================================================
DROP POLICY IF EXISTS "Users can view own subscription" ON newsletter_subscribers;

CREATE POLICY "Users can view own subscription"
  ON newsletter_subscribers FOR SELECT
  TO authenticated
  USING (email = (auth.jwt() ->> 'email'));
