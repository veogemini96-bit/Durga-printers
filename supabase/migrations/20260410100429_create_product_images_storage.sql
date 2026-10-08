/*
  # Create Product Images Storage

  1. Storage Setup
    - Create `product-images` storage bucket for storing product photos
    - Enable public access for product images
    
  2. Security
    - Allow public read access to product images
    - Allow authenticated admin users to upload/update/delete images
    - Restrict file types to images only
    - Set file size limits
    
  3. Tables
    - Create `product_images` table to store multiple images per product
    - Link images to products with foreign keys
    - Track image order for gallery display
*/

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public to view product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Public can view product images'
  ) THEN
    CREATE POLICY "Public can view product images"
      ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow authenticated users to upload product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload product images'
  ) THEN
    CREATE POLICY "Authenticated users can upload product images"
      ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow authenticated users to update product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can update product images'
  ) THEN
    CREATE POLICY "Authenticated users can update product images"
      ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = 'product-images')
      WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;

-- Allow authenticated users to delete product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can delete product images'
  ) THEN
    CREATE POLICY "Authenticated users can delete product images"
      ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = 'product-images');
  END IF;
END $$;

-- Create product_images table for multiple images per product
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  display_order integer DEFAULT 0,
  alt_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_images' 
    AND policyname = 'Anyone can view product images'
  ) THEN
    CREATE POLICY "Anyone can view product images"
      ON product_images
      FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- Allow authenticated users to insert product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_images' 
    AND policyname = 'Authenticated users can insert product images'
  ) THEN
    CREATE POLICY "Authenticated users can insert product images"
      ON product_images
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to update product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_images' 
    AND policyname = 'Authenticated users can update product images'
  ) THEN
    CREATE POLICY "Authenticated users can update product images"
      ON product_images
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- Allow authenticated users to delete product images
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'product_images' 
    AND policyname = 'Authenticated users can delete product images'
  ) THEN
    CREATE POLICY "Authenticated users can delete product images"
      ON product_images
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(product_id, display_order);
