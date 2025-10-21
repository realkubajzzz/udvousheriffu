# Menu Images - Manuálne nahrávanie

## 1. Spustite SQL v Supabase

```sql
-- Spustite obsah súboru bot/menu-images-simple.sql
```

## 2. Nahrajte obrázky do Supabase Storage

### Možnosť A: Cez Supabase Dashboard
1. Idite do Storage → `gallery` bucket
2. Vytvorte priečinok `menu/`
3. Nahrajte obrázky (jpg, png, webp)
4. Poznačte si cestu, napr. `menu/steak.jpg`

### Možnosť B: Cez SQL INSERT
```sql
INSERT INTO public.menu_images (path, caption) VALUES
('menu/steak.jpg', 'Grilovaný steak'),
('menu/pizza.jpg', 'Pizza Margherita'),
('menu/salat.jpg', 'Čerstvý šalát');
```

## 3. Výsledok
- Obrázky sa automaticky objavia na menu.html
- Zoradené podľa času pridania (najnovšie prvé)
- Kliknutie = lightbox
- Realtime updates (nové obrázky sa objavia okamžite)

## Štruktúra tabuľky
```
menu_images:
- id (auto)
- path (cesta v Storage)
- caption (názov jedla - voliteľné)  
- created_at (auto)
```