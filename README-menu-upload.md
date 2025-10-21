# Menu Images - URL linky

## 1. Spustite SQL v Supabase

```sql
-- Spustite obsah súboru bot/menu-images-simple.sql
```

## 2. Nahrajte obrázky na cloud službu

### Odporúčané služby:
- **Imgur** - https://imgur.com (bezplatné, jednoduché)
- **Cloudinary** - https://cloudinary.com
- **Google Drive** (public share link)
- **Dropbox** (public link)
- Akákoľvek iná služba s priamym URL

### Kroky:
1. Nahrajte obrázok na vybraný cloud
2. Skopírujte priamy URL link (končí .jpg, .png, .webp)
3. Vložte do databázy

## 3. Pridajte do databázy

### Cez Supabase Dashboard:
1. Idite do Table Editor → `menu_images`
2. Kliknite "Insert row"
3. Vyplňte:
   - `image_url`: https://i.imgur.com/example.jpg
   - `caption`: Názov jedla (voliteľné)

### Cez SQL:
```sql
INSERT INTO public.menu_images (image_url, caption) VALUES
('https://i.imgur.com/steak123.jpg', 'Grilovaný steak'),
('https://i.imgur.com/pizza456.jpg', 'Pizza Margherita'),
('https://i.imgur.com/salad789.jpg', 'Čerstvý šalát');
```

## 4. Výsledok
- Obrázky sa automaticky objavia na menu.html
- Zoradené podľa času pridania (najnovšie prvé)
- Kliknutie = lightbox s názvom
- Realtime updates (nové obrázky sa objavia okamžite)

## Štruktúra tabuľky
```
menu_images:
- id (auto)
- image_url (priamy URL na obrázok)
- caption (názov jedla - voliteľné)  
- created_at (auto)
```

## Príklad URL formátov:
✅ `https://i.imgur.com/abc123.jpg`
✅ `https://res.cloudinary.com/demo/image/upload/sample.jpg`
✅ `https://example.com/images/food.png`
❌ `https://imgur.com/abc123` (nie priamy link)