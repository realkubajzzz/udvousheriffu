-- Vytvorenie CMS admin užívateľov
-- Spustiť po spustení cms-users-schema.sql

-- Vytvorenie hlavného admin užívateľa
INSERT INTO public.cms_users (username, password_hash, email, full_name, is_active) VALUES 
('admin', crypt('admin123', gen_salt('bf')), 'admin@udvousheriffu.cz', 'Hlavný Administrator', true);

-- Vytvorenie ďalšieho admin užívateľa  
INSERT INTO public.cms_users (username, password_hash, email, full_name, is_active) VALUES 
('sheriff', crypt('sheriff456', gen_salt('bf')), 'sheriff@udvousheriffu.cz', 'Sheriff Manager', true);

-- Vytvorenie manažéra obsahu
INSERT INTO public.cms_users (username, password_hash, email, full_name, is_active) VALUES 
('manager', crypt('manager789', gen_salt('bf')), 'manager@udvousheriffu.cz', 'Content Manager', true);

-- Skontrolovať vytvorených užívateľov
SELECT username, full_name, email, is_active, created_at 
FROM public.cms_users 
ORDER BY created_at;

-- Test prihlásenia (manuálne testovanie funkcie)
-- SELECT * FROM public.cms_verify_login('admin', 'admin123');
-- SELECT * FROM public.cms_verify_login('sheriff', 'sheriff456');
-- SELECT * FROM public.cms_verify_login('manager', 'manager789');

-- Zmena hesla (príklad)
-- UPDATE public.cms_users 
-- SET password_hash = crypt('nove_heslo', gen_salt('bf')) 
-- WHERE username = 'admin';

-- Deaktivácia užívateľa
-- UPDATE public.cms_users SET is_active = false WHERE username = 'manager';

-- Zmazanie užívateľa
-- DELETE FROM public.cms_users WHERE username = 'manager';