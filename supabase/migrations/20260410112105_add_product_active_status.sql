/*
  # Add Product Active Status

  1. Changes
    - Add `is_active` column to products table
    - Default to true for existing products
    - Allow products to be hidden from the website without deleting
  
  2. Notes
    - Existing products will be set to active by default
    - Admins can toggle product visibility without affecting data
*/

-- Add is_active column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE products ADD COLUMN is_active boolean DEFAULT true;
    
    -- Update existing products to be active
    UPDATE products SET is_active = true WHERE is_active IS NULL;
  END IF;
END $$;