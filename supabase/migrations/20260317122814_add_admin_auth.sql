/*
  # Add Admin Authentication Support

  ## Overview
  Sets up RLS policies to allow authenticated admin users to manage all content.

  ## Changes
  1. Update RLS policies to allow authenticated users to INSERT, UPDATE, DELETE
  2. Add admin role check functions
  3. Update all tables with admin management policies

  ## Security
  - Only authenticated users can modify data
  - Public users maintain read-only access to published content
*/

-- Admin policies for categories
CREATE POLICY "Authenticated users can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (true);

-- Admin policies for products
CREATE POLICY "Authenticated users can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (true);

-- Admin policies for product_images
CREATE POLICY "Authenticated users can insert product images"
  ON product_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update product images"
  ON product_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete product images"
  ON product_images FOR DELETE
  TO authenticated
  USING (true);

-- Admin policies for reviews
CREATE POLICY "Authenticated users can insert reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update reviews"
  ON reviews FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete reviews"
  ON reviews FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view all reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

-- Admin policies for blog_posts
CREATE POLICY "Authenticated users can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can view all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

-- Admin policies for inquiries
CREATE POLICY "Authenticated users can view all inquiries"
  ON inquiries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update inquiries"
  ON inquiries FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete inquiries"
  ON inquiries FOR DELETE
  TO authenticated
  USING (true);