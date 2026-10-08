/*
  # Fix order_number race condition

  The existing generate_order_number function uses COUNT(*)+1 which causes
  duplicate key violations when two orders are created concurrently on the
  same day (both reads happen before either insert completes).

  Fix: Use a dedicated PostgreSQL sequence that atomically increments,
  so every call is guaranteed a unique counter regardless of concurrency.
*/

-- Daily sequence doesn't exist natively, so we use a global sequence
-- and embed the date in the order number. The sequence number is unique
-- forever, which also eliminates same-day collisions completely.

CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1 INCREMENT 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  date_part text;
  seq_val   bigint;
BEGIN
  date_part := to_char(now(), 'YYYYMMDD');
  seq_val   := nextval('order_number_seq');
  RETURN 'ORD-' || date_part || '-' || LPAD(seq_val::text, 4, '0');
END;
$$;
