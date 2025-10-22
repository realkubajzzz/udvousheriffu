-- Tabuľka pre CMS admin užívateľov
CREATE TABLE IF NOT EXISTS public.cms_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hash hesla
  email VARCHAR(100),
  full_name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  created_by UUID REFERENCES cms_users(id)
);

-- Zapni RLS
ALTER TABLE public.cms_users ENABLE ROW LEVEL SECURITY;

-- Politiky - len authenticated service_role môže pristupovať
CREATE POLICY "cms_users_service_only" ON public.cms_users
  USING (auth.role() = 'service_role');

-- Index pre rýchle vyhľadávanie
CREATE INDEX IF NOT EXISTS cms_users_username_idx ON public.cms_users (username);
CREATE INDEX IF NOT EXISTS cms_users_active_idx ON public.cms_users (is_active);

-- Grants len pre service_role (nie pre anon/authenticated)
GRANT ALL ON public.cms_users TO service_role;

-- Funkcia pre overenie prihlásenia (volá sa cez service_role)
CREATE OR REPLACE FUNCTION public.cms_verify_login(
  p_username TEXT,
  p_password TEXT
)
RETURNS TABLE(
  user_id UUID,
  username VARCHAR(50),
  full_name VARCHAR(100),
  last_login TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_record cms_users%ROWTYPE;
BEGIN
  -- Nájdi aktívneho užívateľa
  SELECT * INTO v_user_record
  FROM cms_users 
  WHERE cms_users.username = p_username 
    AND is_active = true;
  
  -- Ak užívateľ neexistuje
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Over heslo (bcrypt hash)
  IF crypt(p_password, v_user_record.password_hash) = v_user_record.password_hash THEN
    -- Aktualizuj last_login
    UPDATE cms_users 
    SET last_login = NOW() 
    WHERE id = v_user_record.id;
    
    -- Vráť údaje užívateľa
    RETURN QUERY SELECT 
      v_user_record.id,
      v_user_record.username,
      v_user_record.full_name,
      NOW()::TIMESTAMPTZ;
  END IF;
END;
$$;

-- Grant execute pre service_role
GRANT EXECUTE ON FUNCTION public.cms_verify_login(TEXT, TEXT) TO service_role;

-- Príklad vytvorenia admin užívateľa (heslo: admin123)
-- INSERT INTO public.cms_users (username, password_hash, email, full_name) VALUES 
-- ('admin', crypt('admin123', gen_salt('bf')), 'admin@udvousheriffu.cz', 'Administrator');

-- Príklad vytvorenia ďalšieho užívateľa (heslo: sheriff456) 
-- INSERT INTO public.cms_users (username, password_hash, email, full_name) VALUES 
-- ('sheriff', crypt('sheriff456', gen_salt('bf')), 'sheriff@udvousheriffu.cz', 'Sheriff Manager');