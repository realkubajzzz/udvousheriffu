-- CMS Database Schema pre U Dvou Šerifů
-- Spustite v Supabase SQL Editor

-- 1. Tabuľka pre CMS používateľov
CREATE TABLE IF NOT EXISTS public.cms_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'editor')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabuľka pre CMS sessions
CREATE TABLE IF NOT EXISTS public.cms_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.cms_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Aktualizuj existujúce tabuľky pre CMS správu
-- Pridaj stĺpce pre CMS tracking do gallery tabuľky ak neexistujú
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gallery' AND column_name = 'created_by') THEN
        ALTER TABLE public.gallery ADD COLUMN created_by UUID REFERENCES public.cms_users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gallery' AND column_name = 'updated_by') THEN
        ALTER TABLE public.gallery ADD COLUMN updated_by UUID REFERENCES public.cms_users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gallery' AND column_name = 'updated_at') THEN
        ALTER TABLE public.gallery ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'gallery' AND column_name = 'sort_order') THEN
        ALTER TABLE public.gallery ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- Pridaj stĺpce pre CMS tracking do menu_images tabuľky ak neexistujú
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_images' AND column_name = 'created_by') THEN
        ALTER TABLE public.menu_images ADD COLUMN created_by UUID REFERENCES public.cms_users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_images' AND column_name = 'updated_by') THEN
        ALTER TABLE public.menu_images ADD COLUMN updated_by UUID REFERENCES public.cms_users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_images' AND column_name = 'updated_at') THEN
        ALTER TABLE public.menu_images ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'menu_images' AND column_name = 'sort_order') THEN
        ALTER TABLE public.menu_images ADD COLUMN sort_order INTEGER DEFAULT 0;
    END IF;
END $$;

-- 4. Vytvor tabuľku pre správu akcií
CREATE TABLE IF NOT EXISTS public.cms_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  start_date DATE,
  end_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.cms_users(id),
  updated_by UUID REFERENCES public.cms_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS Policies pre CMS tabuľky
ALTER TABLE public.cms_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_actions ENABLE ROW LEVEL SECURITY;

-- CMS Users policies - povoliť čítanie pre login (anonymný prístup)
CREATE POLICY "cms_users_login" ON public.cms_users
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "cms_users_update" ON public.cms_users
  FOR UPDATE TO authenticated
  USING (auth.uid()::text = id::text);

-- CMS Sessions policies - povoliť anonymný prístup pre login
CREATE POLICY "cms_sessions_all" ON public.cms_sessions
  FOR ALL TO anon, authenticated
  USING (true);

-- CMS Actions policies - public read, authenticated write
CREATE POLICY "cms_actions_read" ON public.cms_actions
  FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "cms_actions_write" ON public.cms_actions
  FOR ALL TO authenticated
  USING (true);

-- 6. Grants
GRANT SELECT ON public.cms_users TO anon, authenticated;  -- Povoli anonymný prístup pre login
GRANT UPDATE ON public.cms_users TO authenticated;
GRANT ALL ON public.cms_sessions TO anon, authenticated;
GRANT SELECT ON public.cms_actions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_actions TO authenticated;
GRANT ALL ON public.cms_users TO service_role;
GRANT ALL ON public.cms_sessions TO service_role;
GRANT ALL ON public.cms_actions TO service_role;

-- 7. Indexy pre výkon
CREATE INDEX IF NOT EXISTS cms_users_username_idx ON public.cms_users (username);
CREATE INDEX IF NOT EXISTS cms_sessions_token_idx ON public.cms_sessions (session_token);
CREATE INDEX IF NOT EXISTS cms_sessions_expires_idx ON public.cms_sessions (expires_at);
CREATE INDEX IF NOT EXISTS cms_actions_active_idx ON public.cms_actions (is_active, start_date, end_date);

-- 8. Vytvor default CMS používateľov
-- POZOR: Zmeňte heslá po prvom prihlásení!
INSERT INTO public.cms_users (username, password_hash, email, role, is_active) 
VALUES 
  (
    'admin', 
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123 (bcrypt)
    'admin@udvousheriffu.sk', 
    'admin', 
    true
  ),
  (
    'editor', 
    '$2a$10$Ez4WjPywwjumEe26m8BfTOC5fCV/e52nbCOF3uJKdD.49ByamArI.', -- editor456 (bcrypt)
    'editor@udvousheriffu.sk', 
    'editor', 
    true
  )
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- 9. Funkcia pre čistenie expired sessions
CREATE OR REPLACE FUNCTION clean_expired_cms_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.cms_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 10. Trigger pre automatické updaty updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pridaj trigger na relevantné tabuľky
DROP TRIGGER IF EXISTS update_cms_users_updated_at ON public.cms_users;
CREATE TRIGGER update_cms_users_updated_at
    BEFORE UPDATE ON public.cms_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_actions_updated_at ON public.cms_actions;
CREATE TRIGGER update_cms_actions_updated_at
    BEFORE UPDATE ON public.cms_actions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ak existujú gallery a menu_images tabuľky, pridaj trigger
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'gallery') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS update_gallery_updated_at ON public.gallery';
    EXECUTE 'CREATE TRIGGER update_gallery_updated_at
        BEFORE UPDATE ON public.gallery
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'menu_images') THEN
    EXECUTE 'DROP TRIGGER IF EXISTS update_menu_images_updated_at ON public.menu_images';
    EXECUTE 'CREATE TRIGGER update_menu_images_updated_at
        BEFORE UPDATE ON public.menu_images
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column()';
  END IF;
END $$;