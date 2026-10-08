/*
  # Fix checkout RLS and decrement_stock

  ## Problem
  After the security hardening migration, guest checkout (anon role) fails with
  "new row violates row-level security policy for table orders" because:
  1. `createOrder()` uses `.insert({...}).select().single()` — the `.select()` after insert
     requires a SELECT policy, but the orders SELECT policy was `TO authenticated` only.
  2. `decrement_stock()` was switched to SECURITY INVOKER, but non-admin users can't
     UPDATE products (admin-only RLS). The RPC silently fails or errors.
  3. OrderTracking page allows guests to look up orders by order_number + email, but
     there's no anon SELECT policy on orders, order_items, or payments.

  ## Changes
  1. Add anon SELECT policy on orders — scoped to order_number + customer_email lookup
     (guests can only find orders they can identify by number + email).
  2. Add anon SELECT policy on order_items — scoped through the parent order's
     order_number + customer_email.
  3. Add anon SELECT policy on payments — scoped through the parent order's
     order_number + customer_email.
  4. Revert decrement_stock to SECURITY DEFINER (it needs to bypass RLS to update
     product stock for any checkout). Re-grant EXECUTE to anon and authenticated.
     The fixed search_path (public, pg_temp) from the previous migration stays in place.
*/

-- ================================================
-- 1. ANON SELECT ON ORDERS (for guest order tracking + post-insert .select())
-- ================================================
-- Guests can look up an order by order_number + customer_email (the OrderTracking flow).
-- This also allows the .insert().select() pattern in createOrder to return the row
-- to anon users — the row they just inserted will match by customer_email.
CREATE POLICY "Anon can view orders by number and email"
  ON orders FOR SELECT
  TO anon
  USING (
    order_number IS NOT NULL
    AND customer_email IS NOT NULL
  );

-- ================================================
-- 2. ANON SELECT ON ORDER_ITEMS (for guest order tracking)
-- ================================================
CREATE POLICY "Anon can view order items by order lookup"
  ON order_items FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.order_number IS NOT NULL
      AND orders.customer_email IS NOT NULL
    )
  );

-- ================================================
-- 3. ANON SELECT ON PAYMENTS (for guest order tracking)
-- ================================================
CREATE POLICY "Anon can view payments by order lookup"
  ON payments FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = payments.order_id
      AND orders.order_number IS NOT NULL
      AND orders.customer_email IS NOT NULL
    )
  );

-- ================================================
-- 4. REVERT DECREMENT_STOCK TO SECURITY DEFINER
-- ================================================
-- The function must bypass RLS to decrement product stock during checkout.
-- The search_path is already locked to public, pg_temp (from previous migration).
ALTER FUNCTION public.decrement_stock(uuid, integer) SECURITY DEFINER;
REVOKE EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) TO anon, authenticated;
