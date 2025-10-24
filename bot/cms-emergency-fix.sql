-- OKAMŽITÉ RIEŠENIE: Vypnutie RLS pre CMS tabuľky
-- Spustite tento súbor v Supabase SQL Editor pre okamžité riešenie problémov

-- Vypnúť RLS úplne pre CMS tabuľky (dočasné riešenie)
ALTER TABLE IF EXISTS public.cms_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gallery DISABLE ROW LEVEL SECURITY;  
ALTER TABLE IF EXISTS public.menu_images DISABLE ROW LEVEL SECURITY;

-- Pridaj potrebné stĺpce ak neexistujú
ALTER TABLE public.gallery ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.menu_images ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;  
ALTER TABLE public.cms_actions ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE public.cms_actions ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Nastaviť počiatočné hodnoty sort_order
UPDATE public.gallery SET sort_order = 0 WHERE sort_order IS NULL;
UPDATE public.menu_images SET sort_order = 0 WHERE sort_order IS NULL;
UPDATE public.cms_actions SET sort_order = 0 WHERE sort_order IS NULL;
UPDATE public.cms_actions SET is_active = true WHERE is_active IS NULL;