/*
  # Add transaction_id to payments table

  1. Changes
    - Adds `transaction_id` column to `payments` table to store the PhonePe merchantTransactionId
    - Adds `updated_at` column to `payments` table for tracking status updates
    - Adds an index on `transaction_id` for fast lookups during payment verification
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'transaction_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN transaction_id text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE payments ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS payments_transaction_id_idx ON payments (transaction_id);
