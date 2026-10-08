
ALTER TABLE products ADD COLUMN IF NOT EXISTS free_shipping boolean NOT NULL DEFAULT false;
