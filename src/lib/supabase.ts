import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  display_order: number;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  base_price: number;
  featured_image: string | null;
  is_featured: boolean;
  is_active: boolean;
  is_customizable: boolean;
  free_shipping: boolean;
  customization_options: any;
  bulk_pricing: any;
  delivery_timeline: string | null;
  sku: string | null;
  stock_quantity: number;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  created_at: string;
}

export interface Review {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  comment: string | null;
  is_verified: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image: string | null;
  author: string;
  published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Inquiry {
  inquiry_type: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  product_type?: string;
  quantity?: number;
  delivery_deadline?: string;
}
