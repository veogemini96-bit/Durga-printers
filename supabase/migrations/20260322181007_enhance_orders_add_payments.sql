/*
  # Enhance Orders and Add Payment System

  1. Table Modifications
    - Add missing columns to `orders` table
    - Create `order_items` table for better normalization
    - Create `payments` table for payment tracking

  2. New Tables
    - `order_items` - Individual items in each order
    - `payments` - Payment transaction records

  3. Security
    - Enable RLS with proper policies
    - Guest and authenticated user access

  4. Important Notes
    - Existing orders table enhanced with payment fields
    - Order items separated for better data management
    - Payment gateway integration ready
*/

-- Add missing columns to orders table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'user_id') THEN
    ALTER TABLE orders ADD COLUMN user_id uuid;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'tax') THEN
    ALTER TABLE orders ADD COLUMN tax decimal(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'shipping_fee') THEN
    ALTER TABLE orders ADD COLUMN shipping_fee decimal(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_method') THEN
    ALTER TABLE orders ADD COLUMN payment_method text;
  END IF;
END $$;

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_image text,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  customization jsonb DEFAULT '{}',
  subtotal decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_gateway text NOT NULL,
  transaction_id text,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'INR',
  status text NOT NULL DEFAULT 'pending',
  payment_data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- Enable RLS on new tables
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Payment policies
CREATE POLICY "Anyone can view payments"
  ON payments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create payments"
  ON payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "System can update payments"
  ON payments FOR UPDATE
  TO anon, authenticated
  WITH CHECK (true);

-- Update existing orders policies to be more permissive for guests
DROP POLICY IF EXISTS "Anyone can view orders" ON orders;
CREATE POLICY "Anyone can view orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "System can update orders" ON orders;
CREATE POLICY "System can update orders"
  ON orders FOR UPDATE
  TO anon, authenticated
  WITH CHECK (true);

-- Function to generate order number (if not exists)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
DECLARE
  new_number text;
  counter integer;
  date_part text;
BEGIN
  date_part := to_char(now(), 'YYYYMMDD');
  
  -- Get the count of orders created today
  SELECT COUNT(*) + 1 INTO counter
  FROM orders
  WHERE order_number LIKE 'ORD-' || date_part || '-%';
  
  new_number := 'ORD-' || date_part || '-' || LPAD(counter::text, 4, '0');
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update payments updated_at
DROP TRIGGER IF EXISTS update_payments_updated_at ON payments;
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
