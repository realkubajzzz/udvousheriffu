-- Migration: Add time columns to cms_actions table
-- Run this SQL in your Supabase SQL editor

-- Add start_time and end_time columns to cms_actions table
ALTER TABLE cms_actions 
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME;

-- Add comments to describe the columns
COMMENT ON COLUMN cms_actions.start_time IS 'Start time for the action (optional)';
COMMENT ON COLUMN cms_actions.end_time IS 'End time for the action (optional)';

-- No constraints needed for time fields as they are optional

-- Done! The CMS will now support time fields for actions