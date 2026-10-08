/*
  # E-commerce Schema for Durgaprinthub.com

  ## Overview
  Complete database schema for a printing business e-commerce website with products, categories, reviews, and blog functionality.

  ## New Tables

  ### 1. categories
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name (e.g., "Wedding Invitations")
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Category description
  - `image_url` (text) - Category image
  - `parent_id` (uuid, nullable) - For subcategories
  - `display_order` (integer) - Sort order
  - `created_at` (timestamptz) - Creation timestamp

  ### 2. products
  - `id` (uuid, primary key) - Unique product identifier
  - `category_id` (uuid) - Foreign key to categories
  - `name` (text) - Product name
  - `slug` (text, unique) - URL-friendly identifier
  - `description` (text) - Full description
  - `short_description` (text) - Brief description
  - `base_price` (decimal) - Base price
  - `featured_image` (text) - Main product image
  - `is_featured` (boolean) - Show on homepage
  - `is_customizable` (boolean) - Can be customized
  - `customization_options` (jsonb) - Customization settings
  - `bulk_pricing` (jsonb) - Bulk pricing tiers
  - `delivery_timeline` (text) - Estimated delivery time
  - `sku` (text, unique) - Stock keeping unit
  - `stock_quantity` (integer) - Available stock
  - `meta_title` (text) - SEO title
  - `meta_description` (text) - SEO description
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. product_images
  - `id` (uuid, primary key) - Unique identifier
  - `product_id` (uuid) - Foreign key to products
  - `image_url` (text) - Image URL
  - `alt_text` (text) - Image alt text for SEO
  - `display_order` (integer) - Sort order
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. reviews
  - `id` (uuid, primary key) - Unique identifier
  - `product_id` (uuid) - Foreign key to products
  - `customer_name` (text) - Reviewer name
  - `rating` (integer) - Rating 1-5
  - `comment` (text) - Review text
  - `is_verified` (boolean) - Verified purchase
  - `is_approved` (boolean) - Admin approved
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. blog_posts
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text) - Post title
  - `slug` (text, unique) - URL-friendly identifier
  - `content` (text) - Post content
  - `excerpt` (text) - Short excerpt
  - `featured_image` (text) - Post image
  - `author` (text) - Author name
  - `published` (boolean) - Published status
  - `meta_title` (text) - SEO title
  - `meta_description` (text) - SEO description
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. inquiries
  - `id` (uuid, primary key) - Unique identifier
  - `inquiry_type` (text) - Type: custom_print, bulk_order, contact
  - `name` (text) - Customer name
  - `email` (text) - Customer email
  - `phone` (text) - Customer phone
  - `message` (text) - Inquiry message
  - `product_type` (text, nullable) - For custom printing
  - `quantity` (integer, nullable) - Requested quantity
  - `delivery_deadline` (date, nullable) - Required delivery date
  - `status` (text) - Status: new, contacted, completed
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Public read access for published content (products, categories, blog posts, reviews)
  - Authenticated users can submit inquiries
  - Only authenticated users (admin) can modify data
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  parent_id uuid REFERENCES categories(id),
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES categories(id),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  short_description text,
  base_price decimal(10,2) NOT NULL,
  featured_image text,
  is_featured boolean DEFAULT false,
  is_customizable boolean DEFAULT false,
  customization_options jsonb,
  bulk_pricing jsonb,
  delivery_timeline text,
  sku text UNIQUE,
  stock_quantity integer DEFAULT 0,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  featured_image text,
  author text DEFAULT 'Durga Printers',
  published boolean DEFAULT false,
  meta_title text,
  meta_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  message text NOT NULL,
  product_type text,
  quantity integer,
  delivery_deadline date,
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO public
  USING (true);

-- RLS Policies for products (public read)
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO public
  USING (true);

-- RLS Policies for product_images (public read)
CREATE POLICY "Anyone can view product images"
  ON product_images FOR SELECT
  TO public
  USING (true);

-- RLS Policies for reviews (public read approved reviews)
CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  TO public
  USING (is_approved = true);

-- RLS Policies for blog_posts (public read published posts)
CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  TO public
  USING (published = true);

-- RLS Policies for inquiries (anyone can insert, no read access)
CREATE POLICY "Anyone can submit inquiries"
  ON inquiries FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);