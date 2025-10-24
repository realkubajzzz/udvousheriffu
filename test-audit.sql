-- Test audit log functionality
-- Spusť v Supabase SQL Editor

-- 1. Skontroluj či tabuľka existuje
SELECT * FROM information_schema.tables WHERE table_name = 'cms_audit_log';

-- 2. Skontroluj štruktúru tabuľky
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cms_audit_log' 
ORDER BY ordinal_position;

-- 3. Skontroluj RLS polícia
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'cms_audit_log';

-- 4. Test insert do audit log (nahraď user_id skutočným ID)
-- INSERT INTO public.cms_audit_log (user_id, username, action, table_name, record_id) 
-- VALUES ('your-user-id-here', 'test_user', 'TEST', 'test_table', gen_random_uuid());

-- 5. Zobraz posledných 10 záznamov z audit logu
SELECT * FROM public.cms_audit_log ORDER BY created_at DESC LIMIT 10;

-- 6. Počet záznamov v audit logu
SELECT COUNT(*) as total_audit_records FROM public.cms_audit_log;