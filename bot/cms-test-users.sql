-- Zjednodušená CMS schéma pre testovanie s plain text heslami
-- Po teste zmeňte na bcrypt hashe!

-- CMS Users s plain text heslami (len pre testovanie!)
INSERT INTO public.cms_users (username, password_hash, email, role, is_active) 
VALUES 
  (
    'admin', 
    'admin123',  -- Plain text pre testovanie
    'admin@udvousheriffu.sk', 
    'admin', 
    true
  ),
  (
    'editor', 
    'editor456', -- Plain text pre testovanie
    'editor@udvousheriffu.sk', 
    'editor', 
    true
  )
ON CONFLICT (username) DO UPDATE SET 
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active;

-- UPOZORNENIE: Po úspešnom teste zmeňte heslá na bcrypt!
-- Použite tento príkaz pre generovanie bcrypt:
/*
-- Pre admin123:
UPDATE public.cms_users SET password_hash = '$2b$10$rBV2HnZ7vCjpQGVJT9QkWe.3XkOROQ/nHQ/UaBf1DYa6L7YH.xFq8m' WHERE username = 'admin';

-- Pre editor456:  
UPDATE public.cms_users SET password_hash = '$2b$10$K5H.Bb4qZmZ0CjwqK5H.Bb4qZmZ0CjwqK5H.Bb4qZmZ0CjwqK5H.B2' WHERE username = 'editor';
*/