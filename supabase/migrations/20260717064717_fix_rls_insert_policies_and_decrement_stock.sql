/*
# Fix RLS INSERT policies and decrement_stock SECURITY DEFINER

## Problem
Security scanner flagged 5 INSERT policies with `WITH CHECK (true)` (bypasses RLS)
and the `decrement_stock` function as a SECURITY DEFINER executable by anon/authenticated.

## Changes

### 1. RLS INSERT policies — meaningful WITH CHECK constraints
Replaces `WITH CHECK (true)` on all 5 flagged INSERT policies:

- **inquiries**: validates that name, email, and message are populated and email
  matches a basic email pattern. Role narrowed from `public` to `anon, authenticated`.
- **newsletter_subscribers**: validates email is present and matches a basic pattern.
- **orders**: ownership check — guests (auth.uid() IS NULL) may only insert orders
  with `user_id IS NULL`; authenticated users may only insert orders where
  `user_id = auth.uid()`. Prevents cross-user order injection.
- **order_items**: ownership check through the parent order — the referenced
  order must belong to the inserter (same guest/owner predicate as orders).
- **payments**: ownership check through the parent order (same predicate).
  Edge-function inserts via the service role bypass RLS, so online-payment
  inserts are unaffected.

### 2. decrement_stock — SECURITY INVOKER + revoke public execute
- Switches from SECURITY DEFINER to SECURITY INVOKER so it no longer runs
  with the function owner's privileges.
- Revokes EXECUTE from anon and authenticated.
- Stock decrement is now performed server-side via the `decrement-stock` edge
  function, which uses the service role key (bypasses RLS legitimately).

### 3. Leaked password protection (HIBP)
- Not a database migration — this is a Supabase Auth config setting managed
  via the Dashboard (Authentication > Settings). See notes in PR description.
*/

-- ================================================
-- 1. INQUIRIES — validate required fields + email format
-- ================================================
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON inquiries;
CREATE POLICY "Anyone can submit inquiries"
  ON inquiries FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    name IS NOT NULL
    AND email IS NOT NULL
    AND message IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- ================================================
-- 2. NEWSLETTER_SUBSCRIBERS — validate email format
-- ================================================
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL
    AND email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  );

-- ================================================
-- 3. ORDERS — ownership check (guest vs authenticated)
-- ================================================
DROP POLICY IF EXISTS "Anyone can insert orders" ON orders;
CREATE POLICY "Anyone can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() = user_id)
  );

-- ================================================
-- 4. ORDER_ITEMS — ownership check through parent order
-- ================================================
DROP POLICY IF EXISTS "Anyone can insert order items" ON order_items;
CREATE POLICY "Anyone can insert order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        (auth.uid() IS NULL AND orders.user_id IS NULL)
        OR orders.user_id = auth.uid()
      )
    )
  );

-- ================================================
-- 5. PAYMENTS — ownership check through parent order
-- ================================================
DROP POLICY IF EXISTS "Anyone can insert payments" ON payments;
CREATE POLICY "Anyone can insert payments"
  ON payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND (
        (auth.uid() IS NULL AND orders.user_id IS NULL)
        OR orders.user_id = auth.uid()
      )
    )
  );

-- ================================================
-- 6. DECREMENT_STOCK — SECURITY INVOKER + revoke public execute
-- ================================================
ALTER FUNCTION public.decrement_stock(uuid, integer) SECURITY INVOKER;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) FROM anon, authenticated;
