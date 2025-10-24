-- Test dáta pre cms_actions tabuľku
-- Spustite v Supabase SQL Editor

-- Vymaž existujúce test dáta (optional)
DELETE FROM public.cms_actions WHERE title LIKE 'Test%';

-- Pridaj test akcie
INSERT INTO public.cms_actions (
    title,
    description,
    image_url,
    is_active,
    start_date,
    end_date,
    sort_order
) VALUES 
(
    'Test Akcia 1 - Večer so šerifom',
    'Špecialny tematický večer s country hudbou a western menu. Prísť v western oblečení!',
    'https://images.unsplash.com/photo-1544191696-15693072e1a2?w=400&h=300&fit=crop',
    true,
    '2024-11-01',
    '2024-11-01',
    1
),
(
    'Test Akcia 2 - Degustačný večer',
    'Ochutnajte naše najlepšie jedlá v špeciálnom 5-chodovom menu s párovaním vín.',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop',
    true,
    '2024-11-15',
    '2024-11-15',
    2
),
(
    'Test Akcia 3 - Zľava pre študentov',
    'Každý študent so študentským preukazom má 20% zľavu na celé menu!',
    null,
    true,
    '2024-10-01',
    '2024-12-31',
    3
);

-- Skontroluj či sa pridali
SELECT 
    title,
    description,
    is_active,
    start_date,
    end_date,
    created_at
FROM public.cms_actions 
WHERE title LIKE 'Test%'
ORDER BY sort_order;