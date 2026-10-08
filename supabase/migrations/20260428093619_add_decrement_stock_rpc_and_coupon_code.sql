/*
  # Add decrement_stock RPC and coupon_code to orders

  1. New Function
    - decrement_stock(product_id uuid, qty int) - safely decrements stock_quantity, never goes below 0

  2. Schema Changes
    - Add coupon_code column to orders table
*/

-- Add coupon_code to orders if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_code text;
  END IF;
END $$;

-- Create decrement_stock function
CREATE OR REPLACE FUNCTION decrement_stock(product_id uuid, qty int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE products
  SET stock_quantity = GREATEST(stock_quantity - qty, 0)
  WHERE id = product_id;
END;
$$;
