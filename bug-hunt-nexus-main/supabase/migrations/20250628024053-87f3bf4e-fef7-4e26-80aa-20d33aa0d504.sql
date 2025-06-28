
-- First, drop the existing foreign key constraint
ALTER TABLE fetched_content DROP CONSTRAINT IF EXISTS fetched_content_platform_id_fkey;

-- Now change platform_id to text to accommodate string IDs
ALTER TABLE fetched_content ALTER COLUMN platform_id TYPE text;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fetched_content_platform_id ON fetched_content(platform_id);
CREATE INDEX IF NOT EXISTS idx_fetched_content_extracted_at ON fetched_content(extracted_at DESC);

-- Note: We're not recreating the foreign key constraint since we now need to support
-- both UUID (from database platforms) and string IDs (from hardcoded platforms)
