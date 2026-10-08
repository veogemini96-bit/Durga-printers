
-- Fix the SKU unique constraint: allow multiple NULL/empty SKUs
-- Drop the existing unique constraint and replace with a partial unique index
-- (only enforces uniqueness when SKU is non-empty)

-- First, normalize empty-string SKUs to NULL so the partial index works cleanly
UPDATE products SET sku = NULL WHERE sku = '';

-- Drop the old unique constraint on sku (it was created as a UNIQUE column constraint)
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;

-- Recreate as a partial unique index — only enforces uniqueness when sku is NOT NULL
DROP INDEX IF EXISTS idx_products_sku_unique;
CREATE UNIQUE INDEX idx_products_sku_unique ON products (sku) WHERE sku IS NOT NULL AND sku != '';

-- Same treatment for categories slug — ensure the trigger uniqueness loop works
-- (slug already has a UNIQUE column constraint which is fine since slugs are always generated)
