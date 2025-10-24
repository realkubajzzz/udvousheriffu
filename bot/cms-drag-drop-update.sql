-- Update existing tables to add sort_order columns
-- Run this in Supabase SQL Editor to add drag & drop ordering functionality

-- Add sort_order to gallery table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gallery' AND column_name = 'sort_order') THEN
        ALTER TABLE public.gallery ADD COLUMN sort_order INTEGER DEFAULT 0;
        
        -- Set initial sort_order based on creation date
        UPDATE public.gallery 
        SET sort_order = sub.row_num - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num 
            FROM public.gallery
        ) sub
        WHERE gallery.id = sub.id;
    END IF;
END $$;

-- Add sort_order to menu_images table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_images' AND column_name = 'sort_order') THEN
        ALTER TABLE public.menu_images ADD COLUMN sort_order INTEGER DEFAULT 0;
        
        -- Set initial sort_order based on creation date
        UPDATE public.menu_images 
        SET sort_order = sub.row_num - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num 
            FROM public.menu_images
        ) sub
        WHERE menu_images.id = sub.id;
    END IF;
END $$;

-- Add sort_order to cms_actions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cms_actions' AND column_name = 'sort_order') THEN
        ALTER TABLE public.cms_actions ADD COLUMN sort_order INTEGER DEFAULT 0;
        
        -- Set initial sort_order based on creation date
        UPDATE public.cms_actions 
        SET sort_order = sub.row_num - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num 
            FROM public.cms_actions
        ) sub
        WHERE cms_actions.id = sub.id;
    END IF;
END $$;

-- Update RLS policies to allow sort_order updates
DROP POLICY IF EXISTS "gallery_update" ON public.gallery;
CREATE POLICY "gallery_update" ON public.gallery
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "menu_images_update" ON public.menu_images;  
CREATE POLICY "menu_images_update" ON public.menu_images
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "cms_actions_update" ON public.cms_actions;
CREATE POLICY "cms_actions_update" ON public.cms_actions
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);