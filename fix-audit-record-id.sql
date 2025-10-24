-- Fix audit log record_id column type
-- Spusť v Supabase SQL Editor

-- 1. Zmeň typ stĺpca record_id z UUID na TEXT
ALTER TABLE public.cms_audit_log 
ALTER COLUMN record_id TYPE TEXT USING record_id::TEXT;

-- 2. Aktualizuj funkciu log_cms_activity
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

-- 3. Test insert pre overenie
-- INSERT INTO public.cms_audit_log (user_id, username, action, table_name, record_id) 
-- VALUES (gen_random_uuid(), 'test_user', 'TEST', 'test_table', '5');

SELECT 'Audit log opravený - record_id je teraz TEXT typ' as status;