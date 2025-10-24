-- CMS Login Fix - Oprava RLS policies pre prihlasovanie
-- Spustite tento súbor ak máte problém s prihlasovaním (406 error)

-- 1. Zruš staré policies
DROP POLICY IF EXISTS "cms_users_read" ON public.cms_users;
DROP POLICY IF EXISTS "cms_users_login" ON public.cms_users;

-- 2. Vytvor novú policy pre login (anonymný + authenticated prístup)
CREATE POLICY "cms_users_login" ON public.cms_users
  FOR SELECT TO anon, authenticated
  USING (true);

-- 3. Uisti sa, že grants sú správne
GRANT SELECT ON public.cms_users TO anon;
GRANT SELECT ON public.cms_users TO authenticated;
GRANT UPDATE ON public.cms_users TO authenticated;
GRANT ALL ON public.cms_sessions TO anon, authenticated;

-- 4. Opravi permissions pre gallery a menu_images (mazanie obrázkov)
GRANT ALL ON public.gallery TO authenticated;
GRANT ALL ON public.menu_images TO authenticated;

-- 5. Uisti sa, že sessions policies sú správne
DROP POLICY IF EXISTS "cms_sessions_own" ON public.cms_sessions;
CREATE POLICY "cms_sessions_all" ON public.cms_sessions
  FOR ALL TO anon, authenticated
  USING (true);

-- 6. Oprav RLS policies pre gallery a menu_images (ak neexistujú)
DO $$
BEGIN
  -- Gallery policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery') THEN
    EXECUTE 'DROP POLICY IF EXISTS "gallery_cms_access" ON public.gallery';
    EXECUTE 'CREATE POLICY "gallery_cms_access" ON public.gallery FOR ALL TO authenticated USING (true)';
    EXECUTE 'ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY';
  END IF;
  
  -- Menu images policies  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_images') THEN
    EXECUTE 'DROP POLICY IF EXISTS "menu_images_cms_access" ON public.menu_images';
    EXECUTE 'CREATE POLICY "menu_images_cms_access" ON public.menu_images FOR ALL TO authenticated USING (true)';
    EXECUTE 'ALTER TABLE public.menu_images ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- 7. Pre istotu - povoľ všetko pre service_role
GRANT ALL ON public.cms_users TO service_role;
GRANT ALL ON public.cms_sessions TO service_role;
GRANT ALL ON public.gallery TO service_role;
GRANT ALL ON public.menu_images TO service_role;

-- Test query - môžete spustiť na overenie
-- SELECT username, is_active FROM public.cms_users WHERE is_active = true;