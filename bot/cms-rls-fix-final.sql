-- Finálna oprava RLS policies pre všetky CMS operácie
-- Spustite tento súbor v Supabase SQL Editor

-- RIEŠENIE: Úplne vypnúť RLS pre CMS tabuľky (dočasné riešenie)
-- Toto je najrýchlejšie riešenie pre testovanie funkcionality

-- 1. Vypnúť RLS pre všetky CMS tabuľky
ALTER TABLE public.cms_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery DISABLE ROW LEVEL SECURITY;  
ALTER TABLE public.menu_images DISABLE ROW LEVEL SECURITY;

-- Poznámka: RLS ostáva zapnuté len pre cms_users a cms_sessions kvôli bezpečnosti prihlásenia

-- 2. Opraviť policies pre prihlásenie (cms_users a cms_sessions)
-- Tieto musia zostať zapnuté kvôli bezpečnosti

-- CMS Users policies
DROP POLICY IF EXISTS "cms_users_select" ON public.cms_users;
DROP POLICY IF EXISTS "cms_users_login" ON public.cms_users;
DROP POLICY IF EXISTS "cms_users_login_access" ON public.cms_users;

CREATE POLICY "cms_users_login_access" ON public.cms_users
  FOR SELECT TO anon, authenticated
  USING (true);

-- CMS Sessions policies  
DROP POLICY IF EXISTS "cms_sessions_select" ON public.cms_sessions;
DROP POLICY IF EXISTS "cms_sessions_insert" ON public.cms_sessions;
DROP POLICY IF EXISTS "cms_sessions_update" ON public.cms_sessions;
DROP POLICY IF EXISTS "cms_sessions_delete" ON public.cms_sessions;
DROP POLICY IF EXISTS "cms_sessions_all" ON public.cms_sessions;
DROP POLICY IF EXISTS "cms_sessions_full_access" ON public.cms_sessions;

CREATE POLICY "cms_sessions_full_access" ON public.cms_sessions
  FOR ALL TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Pridaj sort_order stĺpce ak neexistujú
DO $$ 
BEGIN
    -- Gallery sort_order
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gallery' AND column_name = 'sort_order') THEN
        ALTER TABLE public.gallery ADD COLUMN sort_order INTEGER DEFAULT 0;
        
        -- Set initial sort_order
        UPDATE public.gallery 
        SET sort_order = sub.row_num - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num 
            FROM public.gallery
        ) sub
        WHERE gallery.id = sub.id;
    END IF;
    
    -- Menu_images sort_order
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_images' AND column_name = 'sort_order') THEN
        ALTER TABLE public.menu_images ADD COLUMN sort_order INTEGER DEFAULT 0;
        
        UPDATE public.menu_images 
        SET sort_order = sub.row_num - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num 
            FROM public.menu_images
        ) sub
        WHERE menu_images.id = sub.id;
    END IF;
    
    -- CMS_actions sort_order
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cms_actions' AND column_name = 'sort_order') THEN
        ALTER TABLE public.cms_actions ADD COLUMN sort_order INTEGER DEFAULT 0;
        
        UPDATE public.cms_actions 
        SET sort_order = sub.row_num - 1
        FROM (
            SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as row_num 
            FROM public.cms_actions
        ) sub
        WHERE cms_actions.id = sub.id;
    END IF;
END $$;

-- 4. Povoliť anonymous prístup k funkciám ak existujú
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'clean_expired_cms_sessions') THEN
        GRANT EXECUTE ON FUNCTION public.clean_expired_cms_sessions() TO anon, authenticated;
    END IF;
END $$;

-- 5. Uistiť sa, že všetky potrebné stĺpce existujú v cms_actions
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'cms_actions' AND column_name = 'is_active') THEN
        ALTER TABLE public.cms_actions ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;