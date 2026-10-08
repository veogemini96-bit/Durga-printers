
-- Auto-generate SKU when it is null/blank on INSERT
CREATE OR REPLACE FUNCTION auto_sku_products()
RETURNS TRIGGER AS $$
DECLARE
  cat_prefix  text;
  name_prefix text;
  base_sku    text;
  final_sku   text;
  counter     integer := 1;
BEGIN
  IF NEW.sku IS NULL OR trim(NEW.sku) = '' THEN
    -- Up to 3 chars from category name (uppercased, letters only)
    SELECT upper(regexp_replace(name, '[^A-Za-z]', '', 'g'))
    INTO cat_prefix
    FROM categories WHERE id = NEW.category_id;

    cat_prefix  := left(coalesce(cat_prefix, 'PRD'), 3);

    -- Up to 4 chars from product name (uppercased, letters only)
    name_prefix := left(upper(regexp_replace(NEW.name, '[^A-Za-z]', '', 'g')), 4);

    base_sku := cat_prefix || '-' || name_prefix;

    -- Find next available counter
    LOOP
      final_sku := base_sku || '-' || lpad(counter::text, 4, '0');
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM products
        WHERE sku = final_sku AND id IS DISTINCT FROM NEW.id
      );
      counter := counter + 1;
    END LOOP;

    NEW.sku := final_sku;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_sku_products ON products;
CREATE TRIGGER trg_auto_sku_products
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION auto_sku_products();
