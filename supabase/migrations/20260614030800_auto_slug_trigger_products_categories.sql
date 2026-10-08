
-- Helper function: convert text to URL-friendly slug
CREATE OR REPLACE FUNCTION slugify(text_input text)
RETURNS text AS $$
DECLARE
  result text;
BEGIN
  result := lower(trim(text_input));
  -- Replace non-alphanumeric characters with hyphens
  result := regexp_replace(result, '[^a-z0-9]+', '-', 'g');
  -- Strip leading/trailing hyphens
  result := trim(both '-' from result);
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Auto-slug trigger function for products
CREATE OR REPLACE FUNCTION auto_slug_products()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter   integer := 0;
BEGIN
  -- Only auto-generate when slug is blank
  IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
    base_slug := slugify(NEW.name);
    final_slug := base_slug;

    -- Ensure uniqueness
    LOOP
      IF counter > 0 THEN
        final_slug := base_slug || '-' || counter;
      END IF;

      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM products
        WHERE slug = final_slug AND id IS DISTINCT FROM NEW.id
      );
      counter := counter + 1;
    END LOOP;

    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Auto-slug trigger function for categories
CREATE OR REPLACE FUNCTION auto_slug_categories()
RETURNS TRIGGER AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter   integer := 0;
BEGIN
  IF NEW.slug IS NULL OR trim(NEW.slug) = '' THEN
    base_slug := slugify(NEW.name);
    final_slug := base_slug;

    LOOP
      IF counter > 0 THEN
        final_slug := base_slug || '-' || counter;
      END IF;

      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM categories
        WHERE slug = final_slug AND id IS DISTINCT FROM NEW.id
      );
      counter := counter + 1;
    END LOOP;

    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach triggers (drop first to allow re-running)
DROP TRIGGER IF EXISTS trg_auto_slug_products   ON products;
DROP TRIGGER IF EXISTS trg_auto_slug_categories ON categories;

CREATE TRIGGER trg_auto_slug_products
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION auto_slug_products();

CREATE TRIGGER trg_auto_slug_categories
  BEFORE INSERT OR UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION auto_slug_categories();

-- Backfill: fix any existing products/categories that have a blank slug
UPDATE products   SET slug = '' WHERE slug IS NULL;
UPDATE categories SET slug = '' WHERE slug IS NULL;
-- Re-trigger the function by updating the rows with empty slugs
UPDATE products   SET slug = '' WHERE trim(slug) = '';
UPDATE categories SET slug = '' WHERE trim(slug) = '';
