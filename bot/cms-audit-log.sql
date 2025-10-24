-- Audit Log pre CMS - pridanie logovanie aktivít
-- Spustite tento súbor v Supabase SQL Editor

-- 1. Vytvor audit_log tabuľku
CREATE TABLE IF NOT EXISTS public.cms_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.cms_users(id) ON DELETE SET NULL,
  username TEXT,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,  -- Zmenené z UUID na TEXT pre flexibilitu (INTEGER/UUID IDs)
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS pre audit log - VYPNUTÉ pre jednoduchosť
ALTER TABLE public.cms_audit_log DISABLE ROW LEVEL SECURITY;

-- 3. Funkcia pre automatické logovanie
CREATE OR REPLACE FUNCTION log_cms_activity(
  p_user_id UUID,
  p_username TEXT,
  p_action TEXT,
  p_table_name TEXT,
  p_record_id TEXT DEFAULT NULL,  -- Zmenené z UUID na TEXT
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO public.cms_audit_log (
    user_id, username, action, table_name, record_id, old_data, new_data
  ) VALUES (
    p_user_id, p_username, p_action, p_table_name, p_record_id, p_old_data, p_new_data
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Pridaj indexy pre lepší výkon
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.cms_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.cms_audit_log (user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.cms_audit_log (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.cms_audit_log (action);

-- 5. Povoliť prístup k funkcii
GRANT EXECUTE ON FUNCTION public.log_cms_activity TO anon, authenticated;