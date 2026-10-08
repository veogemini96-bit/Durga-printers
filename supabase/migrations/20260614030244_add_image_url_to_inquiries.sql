
-- Add image_url column to inquiries for custom print design uploads
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inquiries' AND column_name = 'image_url') THEN
    ALTER TABLE inquiries ADD COLUMN image_url text;
  END IF;
END $$;

-- Create storage bucket for custom print uploads if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('custom-prints', 'custom-prints', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read on custom-prints bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public read custom prints'
  ) THEN
    CREATE POLICY "Public read custom prints"
      ON storage.objects FOR SELECT
      TO anon, authenticated
      USING (bucket_id = 'custom-prints');
  END IF;
END $$;

-- Allow anyone to upload to custom-prints bucket
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can upload custom prints'
  ) THEN
    CREATE POLICY "Anyone can upload custom prints"
      ON storage.objects FOR INSERT
      TO anon, authenticated
      WITH CHECK (bucket_id = 'custom-prints');
  END IF;
END $$;
