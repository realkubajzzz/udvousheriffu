-- Príklady menu obrázkov (1080x1920 portrait formát)
-- Spustite po vytvorení tabuľky menu_images

INSERT INTO public.menu_images (image_url, caption) VALUES
-- Príklady s portrait menu obrázkami
('https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=1080&h=1920&fit=crop', 'Pizza Margherita'),
('https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=1080&h=1920&fit=crop', 'Burger s hranolčekmi'),
('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1080&h=1920&fit=crop', 'Fresh šalát'),
('https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1080&h=1920&fit=crop', 'Pancakes s ovocím'),
('https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=1080&h=1920&fit=crop', 'Grilované kuracie mäso'),
('https://images.unsplash.com/photo-1551782450-17144efb9c50?w=1080&h=1920&fit=crop', 'Steak s prílohou')
ON CONFLICT DO NOTHING;

-- Poznámka: Tieto sú len testovacie URL. Pre skutočné menu nahrajte vaše obrázky 
-- na Imgur, Cloudinary alebo inú službu a použite tie URL.