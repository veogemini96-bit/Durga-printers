-- Insert new Thambulam bag products in the Wedding Bags category
-- Category id: 88a9e857-cf03-4af8-ac96-10fe0070eb55

INSERT INTO products (
  category_id, name, slug, short_description, description,
  base_price, stock_quantity, is_active, is_featured, is_customizable,
  delivery_timeline, bulk_pricing, customization_options
) VALUES
(
  '88a9e857-cf03-4af8-ac96-10fe0070eb55',
  'Thambulam Non-Woven Bag 10x12',
  'thambulam-non-woven-bag-10x12',
  'Lightweight non-woven Thambulam bag, 10×12 inches. Available in Yellow and White Sandal.',
  'Premium non-woven Thambulam bags ideal for weddings and traditional events. Size 10×12 inches. Available in Yellow and White Sandal colours. Minimum order 100 bags. Custom printing available.',
  18,
  10000,
  true,
  true,
  true,
  '5–7 business days',
  '[
    {"label":"100 bags","min_quantity":100,"price":18},
    {"label":"200 bags","min_quantity":200,"price":15.5}
  ]'::jsonb,
  '{"colors":["Yellow","White Sandal"],"printing":true}'::jsonb
),
(
  '88a9e857-cf03-4af8-ac96-10fe0070eb55',
  'Cotton Lemon Yellow Bag 10x12',
  'cotton-lemon-yellow-bag-10x12',
  'Premium cotton Thambulam bag, 10×12 inches, in Lemon Yellow. Elegant and eco-friendly.',
  'Soft premium cotton Thambulam bags in a vibrant Lemon Yellow colour. Size 10×12 inches. Perfect for weddings, pooja events, and gifting. Minimum order 100 bags. Custom printing available.',
  24,
  10000,
  true,
  false,
  true,
  '5–7 business days',
  '[
    {"label":"100 bags","min_quantity":100,"price":24},
    {"label":"200 bags","min_quantity":200,"price":21.5}
  ]'::jsonb,
  '{"colors":["Lemon Yellow"],"printing":true}'::jsonb
),
(
  '88a9e857-cf03-4af8-ac96-10fe0070eb55',
  'Cotton Thambulam Bag 11x13',
  'cotton-thambulam-bag-11x13',
  'Spacious cotton Thambulam bag, 11×13 inches. Ideal for larger Thambulam arrangements.',
  'Larger premium cotton Thambulam bags measuring 11×13 inches. Perfect for weddings and grand events where a bigger bag is needed for Thambulam gifting. Minimum order 100 bags. Custom printing available.',
  38,
  10000,
  true,
  false,
  true,
  '5–7 business days',
  '[
    {"label":"100 bags","min_quantity":100,"price":38},
    {"label":"200 bags","min_quantity":200,"price":22}
  ]'::jsonb,
  '{"colors":["Natural White","Lemon Yellow","Custom"],"sizes":["11x13"],"printing":true}'::jsonb
);
