/*
  # Add Sample Data for Durga Printers E-commerce

  ## Overview
  This migration adds sample data to populate the e-commerce website with realistic products, categories, reviews, and blog posts for a fully functional demonstration.

  ## Data Added

  ### 1. Categories (8 categories)
    - Wedding Invitations (theme-based and traditional designs)
    - Wedding Bags (thambulam, non-woven, jute bags)
    - Office Papers (A4, copier, bond papers)
    - POS Supplies (thermal rolls, billing solutions)
    - Visiting Cards (business cards)
    - Envelopes (various sizes and types)
    - Notebooks (ruled, plain, customized)
    - Custom Printing (banners, flex, posters)

  ### 2. Products (20+ products)
    - Various wedding invitation designs (cricket theme, royal theme, floral, traditional)
    - Different types of wedding bags
    - Office paper products
    - Thermal rolls and POS supplies
    - Visiting cards
    - Envelopes
    - Notebooks
    - Custom printing services
    - Each product includes pricing, descriptions, and bulk pricing options

  ### 3. Product Reviews (15+ reviews)
    - Authentic customer reviews across different products
    - 4-5 star ratings
    - Verified purchase reviews
    - Approved for public display

  ### 4. Blog Posts (5 articles)
    - Wedding planning guides
    - Printing tips and trends
    - Product showcases
    - Industry insights

  ## Notes
  - All products have realistic pricing
  - Bulk pricing tiers included where applicable
  - Stock quantities set for all products
  - Featured products marked for homepage display
  - All data uses stock photos from Pexels
*/

-- Insert Categories
INSERT INTO categories (name, slug, description, image_url, display_order) VALUES
('Wedding Invitations', 'wedding-invitations', 'Beautiful theme-based and traditional wedding invitation cards', 'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=800', 1),
('Wedding Bags', 'wedding-bags', 'Thambulam bags, non-woven bags, and jute bags for weddings', 'https://images.pexels.com/photos/1444424/pexels-photo-1444424.jpeg?auto=compress&cs=tinysrgb&w=800', 2),
('Office Papers', 'office-papers', 'TNPL A4 papers, copier papers, and bond papers', 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800', 3),
('POS Supplies', 'pos-supplies', 'Thermal rolls and billing solutions for retail', 'https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg?auto=compress&cs=tinysrgb&w=800', 4),
('Visiting Cards', 'visiting-cards', 'Professional business cards with various finishes', 'https://images.pexels.com/photos/6102294/pexels-photo-6102294.jpeg?auto=compress&cs=tinysrgb&w=800', 5),
('Envelopes', 'envelopes', 'All sizes and types of envelopes', 'https://images.pexels.com/photos/96612/pexels-photo-96612.jpeg?auto=compress&cs=tinysrgb&w=800', 6),
('Notebooks', 'notebooks', 'Ruled, plain, and customized notebooks', 'https://images.pexels.com/photos/3255761/pexels-photo-3255761.jpeg?auto=compress&cs=tinysrgb&w=800', 7),
('Custom Printing', 'custom-printing', 'Banners, flex printing, and posters', 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800', 8)
ON CONFLICT (slug) DO NOTHING;

-- Get category IDs for reference
DO $$
DECLARE
  cat_wedding_inv uuid;
  cat_wedding_bags uuid;
  cat_office_papers uuid;
  cat_pos_supplies uuid;
  cat_visiting_cards uuid;
  cat_envelopes uuid;
  cat_notebooks uuid;
  cat_custom_printing uuid;
BEGIN
  SELECT id INTO cat_wedding_inv FROM categories WHERE slug = 'wedding-invitations';
  SELECT id INTO cat_wedding_bags FROM categories WHERE slug = 'wedding-bags';
  SELECT id INTO cat_office_papers FROM categories WHERE slug = 'office-papers';
  SELECT id INTO cat_pos_supplies FROM categories WHERE slug = 'pos-supplies';
  SELECT id INTO cat_visiting_cards FROM categories WHERE slug = 'visiting-cards';
  SELECT id INTO cat_envelopes FROM categories WHERE slug = 'envelopes';
  SELECT id INTO cat_notebooks FROM categories WHERE slug = 'notebooks';
  SELECT id INTO cat_custom_printing FROM categories WHERE slug = 'custom-printing';

  -- Insert Wedding Invitation Products
  INSERT INTO products (category_id, name, slug, description, short_description, base_price, featured_image, is_featured, is_customizable, customization_options, bulk_pricing, delivery_timeline, sku, stock_quantity) VALUES
  (cat_wedding_inv, 'Cricket Theme Wedding Card', 'cricket-theme-wedding-card', 'Unique cricket-themed wedding invitation perfect for cricket enthusiasts. Features elegant design with cricket elements. Fully customizable with your details. Premium quality card stock with vibrant printing.', 'Cricket-themed wedding invitation for sports lovers', 12.00, 'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, '{"colors": ["Gold", "Red", "Blue"], "finishes": ["Matte", "Glossy"], "sizes": ["5x7", "6x8"]}', '{"100": 10, "500": 8, "1000": 6}', '7-10 business days', 'WED-CRI-001', 500),
  (cat_wedding_inv, 'Royal Theme Wedding Invitation', 'royal-theme-wedding-invitation', 'Elegant royal-themed wedding card with gold foil detailing. Traditional design with modern aesthetics. Available in multiple color combinations. Premium quality with intricate patterns.', 'Elegant royal-themed invitation with gold foil', 15.00, 'https://images.pexels.com/photos/1444424/pexels-photo-1444424.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, '{"colors": ["Royal Blue", "Maroon", "Golden"], "finishes": ["Gold Foil", "Matte"], "embossing": true}', '{"100": 13, "500": 11, "1000": 9}', '10-14 business days', 'WED-ROY-001', 300),
  (cat_wedding_inv, 'Floral Wedding Card', 'floral-wedding-card', 'Beautiful floral-themed wedding invitation with pastel colors. Perfect for spring and summer weddings. Delicate floral patterns with elegant typography. High-quality cardstock.', 'Delicate floral design for elegant weddings', 10.00, 'https://images.pexels.com/photos/3171815/pexels-photo-3171815.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, '{"colors": ["Pink", "Lavender", "Mint"], "finishes": ["Matte", "Glossy"]}', '{"100": 8, "500": 6.5, "1000": 5}', '7-10 business days', 'WED-FLO-001', 600),
  (cat_wedding_inv, 'Traditional South Indian Wedding Card', 'traditional-south-indian-wedding-card', 'Classic South Indian wedding invitation with traditional motifs. Features temple designs and auspicious symbols. Red and gold color scheme. Cultural and elegant.', 'Traditional design with South Indian motifs', 11.00, 'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800', false, true, '{"colors": ["Red & Gold", "Maroon & Gold"], "finishes": ["Matte"]}', '{"100": 9, "500": 7, "1000": 5.5}', '7-10 business days', 'WED-TRA-001', 400),
  
  -- Wedding Bags Products
  (cat_wedding_bags, 'Thambulam Non-Woven Bag', 'thambulam-non-woven-bag', 'Eco-friendly non-woven thambulam bags for wedding gifts. Durable and reusable. Available in multiple colors. Can be customized with names or designs. Perfect for wedding favors.', 'Eco-friendly bags for wedding gifts', 25.00, 'https://images.pexels.com/photos/1444424/pexels-photo-1444424.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, '{"colors": ["Red", "Gold", "Maroon", "Pink"], "printing": true, "sizes": ["Small", "Medium", "Large"]}', '{"100": 22, "500": 18, "1000": 15}', '5-7 business days', 'BAG-NON-001', 1000),
  (cat_wedding_bags, 'Jute Thambulam Bag', 'jute-thambulam-bag', 'Premium jute bags for traditional wedding thambulam. Natural and biodegradable. Stylish and durable. Can be printed with custom designs. Eco-conscious choice.', 'Premium jute bags for traditional gifts', 35.00, 'https://images.pexels.com/photos/3738382/pexels-photo-3738382.jpeg?auto=compress&cs=tinysrgb&w=800', false, true, '{"colors": ["Natural", "Colored"], "printing": true, "handles": ["Short", "Long"]}', '{"100": 32, "500": 28, "1000": 24}', '7-10 business days', 'BAG-JUT-001', 500),
  (cat_wedding_bags, 'Fancy Wedding Gift Bag', 'fancy-wedding-gift-bag', 'Decorative wedding gift bags with handles. Premium quality with attractive designs. Multiple sizes available. Perfect for wedding returns and favors.', 'Decorative bags for wedding returns', 20.00, 'https://images.pexels.com/photos/1666067/pexels-photo-1666067.jpeg?auto=compress&cs=tinysrgb&w=800', false, true, '{"colors": ["Gold", "Silver", "Red"], "sizes": ["Small", "Medium", "Large"]}', '{"100": 18, "500": 15, "1000": 12}', '5-7 business days', 'BAG-FAN-001', 800),
  
  -- Office Papers Products
  (cat_office_papers, 'TNPL A4 Copier Paper (500 Sheets)', 'tnpl-a4-copier-paper-500', 'Premium TNPL A4 copier paper. 75 GSM. 500 sheets per ream. Excellent whiteness and opacity. Suitable for all printers and copiers. Smooth finish for professional documents.', 'TNPL A4 paper, 75 GSM, 500 sheets', 280.00, 'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800', true, false, null, '{"5": 270, "10": 260, "50": 245}', '2-3 business days', 'PAP-A4-500', 2000),
  (cat_office_papers, 'Bond Paper A4 (100 Sheets)', 'bond-paper-a4-100', 'High-quality bond paper for official documents. 100 sheets pack. Suitable for certificates and important documents. Superior quality and finish.', 'Bond paper for official documents', 180.00, 'https://images.pexels.com/photos/4226881/pexels-photo-4226881.jpeg?auto=compress&cs=tinysrgb&w=800', false, false, null, '{"10": 170, "50": 155}', '2-3 business days', 'PAP-BON-100', 500),
  
  -- POS Supplies Products
  (cat_pos_supplies, 'Thermal Paper Roll 80mm x 50m', 'thermal-paper-roll-80mm', 'Premium thermal paper rolls for billing machines. 80mm width, 50 meters length. High-quality paper with excellent print clarity. BPA-free. Pack of 10 rolls.', 'Thermal rolls for POS billing machines', 450.00, 'https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg?auto=compress&cs=tinysrgb&w=800', false, false, null, '{"5": 430, "10": 400, "50": 370}', '1-2 business days', 'POS-THE-80', 1500),
  (cat_pos_supplies, 'Thermal Paper Roll 57mm x 25m', 'thermal-paper-roll-57mm', 'Compact thermal rolls for mobile billing. 57mm width, 25 meters. Pack of 10 rolls. Suitable for portable printers. High quality with clear printing.', 'Compact thermal rolls for mobile billing', 280.00, 'https://images.pexels.com/photos/4386372/pexels-photo-4386372.jpeg?auto=compress&cs=tinysrgb&w=800', false, false, null, '{"5": 270, "10": 250, "50": 230}', '1-2 business days', 'POS-THE-57', 2000),
  
  -- Visiting Cards Products
  (cat_visiting_cards, 'Premium Business Cards (300 GSM)', 'premium-business-cards-300gsm', 'Professional visiting cards in premium 300 GSM cardstock. Matte or glossy finish. Full color printing both sides. Minimum order 500 cards. Sharp text and vibrant colors.', 'Premium 300 GSM business cards', 600.00, 'https://images.pexels.com/photos/6102294/pexels-photo-6102294.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, '{"finishes": ["Matte", "Glossy", "UV Spot"], "quantity": ["500", "1000", "2000"]}', '{"500": 600, "1000": 1000, "2000": 1800}', '3-5 business days', 'VIS-PRE-300', 100),
  (cat_visiting_cards, 'Standard Business Cards (250 GSM)', 'standard-business-cards-250gsm', 'Quality business cards in 250 GSM cardstock. Matte finish. Full color printing. Minimum order 500 cards. Professional and affordable.', 'Quality 250 GSM business cards', 450.00, 'https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=800', false, true, '{"finishes": ["Matte"], "quantity": ["500", "1000"]}', '{"500": 450, "1000": 750}', '3-5 business days', 'VIS-STD-250', 100),
  
  -- Envelopes Products
  (cat_envelopes, 'White Envelopes (Pack of 100)', 'white-envelopes-100', 'Standard white envelopes for documents and letters. Pack of 100. Multiple sizes available. Good quality paper. Self-seal or gummed options.', 'White envelopes for documents', 150.00, 'https://images.pexels.com/photos/96612/pexels-photo-96612.jpeg?auto=compress&cs=tinysrgb&w=800', false, false, null, '{"10": 140, "50": 125}', '2-3 business days', 'ENV-WHI-100', 1000),
  (cat_envelopes, 'Brown Kraft Envelopes (Pack of 100)', 'brown-kraft-envelopes-100', 'Heavy-duty brown kraft envelopes. Pack of 100. Strong and durable. Various sizes. Perfect for mailing documents and products.', 'Durable brown kraft envelopes', 180.00, 'https://images.pexels.com/photos/6169668/pexels-photo-6169668.jpeg?auto=compress&cs=tinysrgb&w=800', false, false, null, '{"10": 170, "50": 155}', '2-3 business days', 'ENV-KRA-100', 800),
  
  -- Notebooks Products
  (cat_notebooks, 'Ruled Notebook (200 Pages)', 'ruled-notebook-200', 'Quality ruled notebook with 200 pages. A4 size. Durable binding. Smooth writing paper. Perfect for students and professionals.', 'A4 ruled notebook, 200 pages', 85.00, 'https://images.pexels.com/photos/3255761/pexels-photo-3255761.jpeg?auto=compress&cs=tinysrgb&w=800', false, false, null, '{"10": 80, "50": 72, "100": 65}', '2-3 business days', 'NOT-RUL-200', 500),
  (cat_notebooks, 'Plain Notebook (160 Pages)', 'plain-notebook-160', 'Plain notebook for sketching and notes. 160 pages. A5 size. Quality binding. Smooth paper. Ideal for creative work.', 'A5 plain notebook, 160 pages', 65.00, 'https://images.pexels.com/photos/1329711/pexels-photo-1329711.jpeg?auto=compress&cs=tinysrgb&w=800', false, false, null, '{"10": 60, "50": 54, "100": 48}', '2-3 business days', 'NOT-PLA-160', 600),
  (cat_notebooks, 'Customized Corporate Notebook', 'customized-corporate-notebook', 'Premium customized notebooks for corporate gifting. Your logo and branding. Multiple page counts and sizes. High-quality materials. Minimum order 50 pieces.', 'Customized notebooks with your branding', 120.00, 'https://images.pexels.com/photos/4226140/pexels-photo-4226140.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, '{"sizes": ["A4", "A5"], "pages": ["100", "160", "200"], "covers": ["Hard", "Soft"], "printing": true}', '{"50": 120, "100": 110, "500": 95}', '7-10 business days', 'NOT-CUS-COR', 200),
  
  -- Custom Printing Products
  (cat_custom_printing, 'Vinyl Banner Printing (per sq ft)', 'vinyl-banner-printing', 'High-quality vinyl banner printing. Weather-resistant. Vibrant colors. Suitable for outdoor and indoor use. Custom sizes available. Includes grommets for easy hanging.', 'Durable vinyl banners for all occasions', 45.00, 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=800', true, true, '{"sizes": ["Custom"], "finishes": ["Matte", "Glossy"], "grommets": true}', '{"50": 42, "100": 38, "500": 35}', '3-5 business days', 'PRI-BAN-VIN', 100),
  (cat_custom_printing, 'Flex Printing (per sq ft)', 'flex-printing', 'Premium flex printing for large format displays. High resolution. Bright and vivid colors. Suitable for hoardings and displays. Custom sizes.', 'Large format flex printing', 38.00, 'https://images.pexels.com/photos/1449791/pexels-photo-1449791.jpeg?auto=compress&cs=tinysrgb&w=800', false, true, '{"sizes": ["Custom"], "mounting": ["With Frame", "Without Frame"]}', '{"50": 35, "100": 32, "500": 28}', '3-5 business days', 'PRI-FLE-001', 100)
  ON CONFLICT (slug) DO NOTHING;

END $$;

-- Insert Product Reviews
DO $$
DECLARE
  prod_cricket uuid;
  prod_royal uuid;
  prod_floral uuid;
  prod_thambulam uuid;
  prod_a4_paper uuid;
  prod_thermal uuid;
  prod_visiting uuid;
BEGIN
  SELECT id INTO prod_cricket FROM products WHERE slug = 'cricket-theme-wedding-card';
  SELECT id INTO prod_royal FROM products WHERE slug = 'royal-theme-wedding-invitation';
  SELECT id INTO prod_floral FROM products WHERE slug = 'floral-wedding-card';
  SELECT id INTO prod_thambulam FROM products WHERE slug = 'thambulam-non-woven-bag';
  SELECT id INTO prod_a4_paper FROM products WHERE slug = 'tnpl-a4-copier-paper-500';
  SELECT id INTO prod_thermal FROM products WHERE slug = 'thermal-paper-roll-80mm';
  SELECT id INTO prod_visiting FROM products WHERE slug = 'premium-business-cards-300gsm';

  INSERT INTO reviews (product_id, customer_name, rating, comment, is_verified, is_approved) VALUES
  (prod_cricket, 'Ramesh Kumar', 5, 'Absolutely loved the cricket theme cards! Perfect for our cricket-loving family. The quality is outstanding and everyone at the wedding complimented them.', true, true),
  (prod_cricket, 'Sneha Patel', 5, 'Unique and beautiful design. The printing quality is excellent. Highly recommend for cricket enthusiasts!', true, true),
  (prod_cricket, 'Arun Reddy', 4, 'Great quality cards. The cricket theme was a hit at our wedding. Delivery was on time.', true, true),
  
  (prod_royal, 'Lakshmi Devi', 5, 'The gold foil work is exquisite! Very royal and elegant. Worth every rupee.', true, true),
  (prod_royal, 'Karthik Sharma', 5, 'Premium quality wedding cards. The royal theme perfectly matched our wedding aesthetics.', true, true),
  
  (prod_floral, 'Divya Krishnan', 5, 'Beautiful floral designs! The pastel colors are so elegant. Received many compliments.', true, true),
  (prod_floral, 'Priya Menon', 5, 'Lovely cards for our summer wedding. The quality exceeded expectations.', true, true),
  
  (prod_thambulam, 'Rajesh Naidu', 5, 'Excellent thambulam bags! Good quality and the custom printing came out perfect.', true, true),
  (prod_thambulam, 'Meena Iyer', 4, 'Nice eco-friendly bags. Good value for bulk orders. Our guests loved them.', true, true),
  
  (prod_a4_paper, 'Office Admin', 5, 'Best A4 paper for office use. Consistent quality. We order regularly.', true, true),
  (prod_a4_paper, 'Suresh & Co', 5, 'TNPL quality is always reliable. Good bulk pricing too.', true, true),
  
  (prod_thermal, 'Retail Shop', 5, 'Perfect thermal rolls for our billing machine. Clear printing and good length.', true, true),
  
  (prod_visiting, 'Consultant Professional', 5, 'Premium business cards with excellent finish. Very professional look. Worth the investment.', true, true),
  (prod_visiting, 'Startup Founder', 5, 'High quality visiting cards. The UV spot finish looks amazing!', true, true),
  (prod_visiting, 'Sales Manager', 4, 'Good quality cards. Sharp printing and nice texture. Recommended.', true, true)
  ON CONFLICT DO NOTHING;

END $$;

-- Insert Blog Posts
INSERT INTO blog_posts (title, slug, content, excerpt, featured_image, author, published) VALUES
('Top 10 Wedding Invitation Trends for 2026', 'top-10-wedding-invitation-trends-2026', 
'Wedding invitations set the tone for your special day. Here are the top trends for 2026 that are making waves in the wedding industry.

1. **Theme-Based Invitations**: From cricket to travel, couples are choosing themes that reflect their unique story and interests.

2. **Eco-Friendly Materials**: Sustainable options like recycled paper and plantable cards are increasingly popular among environmentally conscious couples.

3. **Minimalist Designs**: Clean, simple designs with elegant typography are replacing overly ornate cards.

4. **Digital Integration**: QR codes linking to wedding websites and RSVP forms are becoming standard.

5. **Metallic Accents**: Gold, rose gold, and copper foil details add a touch of luxury.

6. **Watercolor Effects**: Soft, artistic watercolor backgrounds create romantic aesthetics.

7. **Bold Typography**: Large, statement fonts are making invitations more readable and impactful.

8. **Cultural Fusion**: Blending traditional and modern elements to honor heritage while staying contemporary.

9. **Custom Illustrations**: Hand-drawn elements and personalized artwork make invitations unique.

10. **Interactive Elements**: Pop-ups, fold-outs, and textured papers engage guests before the wedding.

At Durga Printers, we can help you create invitations that match any of these trends. Contact us to discuss your vision!', 
'Discover the latest wedding invitation trends for 2026, from eco-friendly materials to theme-based designs.', 
'https://images.pexels.com/photos/265722/pexels-photo-265722.jpeg?auto=compress&cs=tinysrgb&w=800', 
'Durga Printers Team', true),

('How to Choose the Perfect Wedding Invitation', 'how-to-choose-perfect-wedding-invitation',
'Your wedding invitation is the first glimpse your guests get of your special day. Here is a comprehensive guide to choosing the perfect invitation.

## Consider Your Wedding Theme

Your invitation should reflect the overall theme and style of your wedding. A beach wedding calls for light, breezy designs, while a formal ballroom wedding demands elegant, sophisticated cards.

## Budget Planning

Set a realistic budget early. Remember to account for:
- Design and printing costs
- Envelopes and inserts
- Postage
- Extra cards for keepsakes

## Timeline Matters

Order your invitations 3-4 months before the wedding. Send them out 6-8 weeks before the big day. For destination weddings, add extra time.

## Essential Information

Include:
- Names of the couple
- Date, time, and venue
- RSVP details
- Dress code (if applicable)
- Direction or map cards

## Quality Over Quantity

Invest in good quality paper and printing. Your guests will notice the difference, and the invitations will become cherished keepsakes.

## Proofreading is Crucial

Triple-check all details before printing. Have multiple people review the content to catch any errors.

At Durga Printers, we offer personalized consultation to help you make the perfect choice for your wedding invitations.',
'A complete guide to selecting wedding invitations that perfectly match your special day.',
'https://images.pexels.com/photos/1444442/pexels-photo-1444442.jpeg?auto=compress&cs=tinysrgb&w=800',
'Durga Printers Team', true),

('Office Paper Guide: Choosing the Right Paper for Your Business', 'office-paper-guide-choosing-right-paper',
'Not all office papers are created equal. This guide will help you choose the right paper for your business needs.

## Understanding Paper Weight (GSM)

GSM (grams per square meter) indicates paper thickness:
- 70-75 GSM: Standard copier paper
- 80-90 GSM: Premium copier paper
- 100+ GSM: Presentations and reports

## Paper Brightness and Whiteness

Higher brightness ratings (90+) produce sharper text and more vibrant colors. Important for professional documents.

## Choosing Paper for Different Needs

### Daily Printing
TNPL A4 75 GSM is perfect for everyday documents, memos, and internal communications.

### Client-Facing Documents
Use 80-90 GSM paper for proposals, contracts, and presentations.

### Certificates and Awards
Bond paper or cardstock (100+ GSM) for official documents.

## Environmental Considerations

Look for:
- Recycled content
- FSC certification
- Chlorine-free bleaching

## Cost vs. Quality

While premium paper costs more upfront, it reduces printer jams, produces better quality prints, and creates a more professional impression.

## Storage Tips

- Store paper in cool, dry places
- Keep in original packaging
- Avoid direct sunlight
- Use older stock first

Durga Printers offers a complete range of office papers to meet all your business needs.',
'Everything you need to know about choosing the right office paper for your business.',
'https://images.pexels.com/photos/261763/pexels-photo-261763.jpeg?auto=compress&cs=tinysrgb&w=800',
'Durga Printers Team', true),

('Thermal Paper 101: A Complete Guide for Retailers', 'thermal-paper-guide-for-retailers',
'Thermal paper is essential for retail billing. Here is everything retailers need to know about choosing and using thermal paper.

## How Thermal Paper Works

Thermal paper has a special coating that changes color when heated. No ink or toner is needed, making it cost-effective and efficient.

## Choosing the Right Size

### 80mm Rolls
Standard size for most POS systems and billing machines. Ideal for retail stores, restaurants, and supermarkets.

### 57mm Rolls
Compact size perfect for mobile billing, delivery receipts, and portable printers.

## Quality Factors

### Print Clarity
High-quality thermal paper ensures sharp, readable receipts that last longer.

### Paper Thickness
Thicker paper (48-55 microns) is more durable and prevents jamming.

### Core Size
Standard cores fit most printers. Verify compatibility before ordering.

## BPA-Free Options

Many customers prefer BPA-free thermal paper for health and environmental reasons. We offer BPA-free options for conscious businesses.

## Storage and Handling

- Keep away from heat and direct sunlight
- Store in cool, dry conditions
- Avoid contact with plastics and chemicals
- Use within recommended shelf life

## Bulk Buying Benefits

Retailers can save significantly by ordering thermal paper in bulk. We offer competitive wholesale pricing for regular customers.

## Troubleshooting Common Issues

- Faded prints: Replace thermal head or use higher quality paper
- Paper jams: Check paper alignment and core size
- Curling: Store properly and avoid humidity

Contact Durga Printers for premium thermal paper rolls with guaranteed quality and timely delivery.',
'Complete guide to thermal paper for retail billing and POS systems.',
'https://images.pexels.com/photos/4968630/pexels-photo-4968630.jpeg?auto=compress&cs=tinysrgb&w=800',
'Durga Printers Team', true),

('The Importance of Professional Business Cards in Digital Age', 'importance-of-business-cards-digital-age',
'Despite digital networking, business cards remain a powerful tool for professional connections.

## Why Business Cards Still Matter

### First Impressions
A well-designed business card creates a lasting first impression and shows professionalism.

### Tangible Connection
Physical cards create a more personal connection than digital exchanges.

### Branding Tool
Your card is a mini-billboard for your brand, conveying your style and values.

### Networking Efficiency
Quick and easy to exchange in face-to-face meetings and events.

## Design Tips for Effective Business Cards

### Keep It Simple
Include only essential information:
- Name and designation
- Company name
- Contact details
- Logo

### Choose Quality Materials
Premium cardstock (300 GSM) feels substantial and professional.

### Typography Matters
Use readable fonts. Avoid cramming too much information.

### Color Psychology
Choose colors that align with your brand and industry.

### Finishing Touches
Consider matte, glossy, or UV spot finishes for added impact.

## Common Mistakes to Avoid

- Too much information
- Poor quality paper
- Difficult-to-read fonts
- Outdated contact information
- Inconsistent branding

## Digital Integration

Include QR codes linking to:
- Your website
- LinkedIn profile
- Digital portfolio
- Contact information

## Quantity Considerations

Order enough cards but not too many if your information might change. A minimum of 500 cards is recommended for most professionals.

At Durga Printers, we create premium business cards that make lasting impressions. Explore our visiting card collection today!',
'Why business cards remain essential networking tools in the digital age.',
'https://images.pexels.com/photos/6102294/pexels-photo-6102294.jpeg?auto=compress&cs=tinysrgb&w=800',
'Durga Printers Team', true)
ON CONFLICT (slug) DO NOTHING;