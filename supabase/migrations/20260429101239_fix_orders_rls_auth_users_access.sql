/*
  # Fix orders RLS policies - replace auth.users subquery with auth.email()

  The SELECT and UPDATE policies were querying auth.users directly, which
  the anon role cannot access, causing "permission denied for table users"
  errors during guest checkout and order viewing.

  Replace the subquery with the built-in auth.email() helper function which
  works for both authenticated and anonymous contexts.
*/

DROP POLICY IF EXISTS "Authenticated users can view own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update own orders" ON orders;

CREATE POLICY "Authenticated users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR customer_email = auth.email()
  );

CREATE POLICY "Authenticated users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR customer_email = auth.email()
  )
  WITH CHECK (true);
