-- Migration: Add short_text column to cms_actions table
-- Run this SQL in your Supabase SQL editor

-- Add short_text column to cms_actions table
ALTER TABLE cms_actions 
ADD COLUMN short_text TEXT;

-- Add comment to describe the column
COMMENT ON COLUMN cms_actions.short_text IS 'Short description for homepage display (max 120 characters)';

-- Optional: Update existing records with a default short text from description
-- (This can be run after adding the column)
UPDATE cms_actions 
SET short_text = LEFT(description, 120)
WHERE short_text IS NULL 
  AND description IS NOT NULL 
  AND LENGTH(description) > 0;

-- Add a check constraint to limit length to 120 characters
ALTER TABLE cms_actions 
ADD CONSTRAINT short_text_length_check 
CHECK (LENGTH(short_text) <= 120);

-- Done! The CMS will now support the new short_text field