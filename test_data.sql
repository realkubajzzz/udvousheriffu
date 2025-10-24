-- Pridanie testovacích recenzií do databázy
-- Spustiť v Supabase SQL editore

INSERT INTO reviews (customer_name, rating, review_text, is_approved) VALUES 
('Jakub Novák', 5, 'Výborná reštaurácia! Jedlo bolo fantastické a obsluha veľmi príjemná. Určite sa vrátim.', true),
('Mária Svobodová', 5, 'Najlepší goulash aký som kedy jedla! Atmosféra ako v pravom westernovom filme.', true),
('Tomáš Dvořák', 4, 'Veľmi dobré jedlo a prijateľné ceny. Prostredie je originálne a zábavné.', true),
('Anna Krejčí', 5, 'Perfektné miesto pre rodinnú večeru. Deti sa zabávali s témou a jedlo bolo chutné.', true),
('Pavel Cerný', 5, 'Skvelá obsluha a autentická western atmosféra. Steaky sú vynikajúce!', true),
('Lucia Horáková', 3, 'Jedlo bolo v poriadku, ale čakanie bolo trochu dlhé.', false),
('Michal Kováč', 5, 'Úžasný zážitok! Cítil som sa ako v pravom westernovom filme. Určite odporúčam!', true);