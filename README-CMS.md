# CMS Admin Panel - Návod na nastavenie

## 🏗️ Nastavenie databázy

### 1. Spustite SQL schémy v Supabase (v tomto poradí):

```sql
-- 1. Vytvorenie CMS užívateľskej tabuľky
-- Spustite obsah: bot/cms-users-schema.sql

-- 2. Vytvorenie testovacích užívateľov  
-- Spustite obsah: bot/cms-create-users.sql
```

## 👤 Prednastavení užívatelia

Po spustení SQL skriptov budete mať k dispozícii:

| Užívateľ | Heslo | Rola |
|----------|--------|------|
| `admin` | `admin123` | Hlavný Administrator |
| `sheriff` | `sheriff456` | Sheriff Manager |
| `manager` | `manager789` | Content Manager |

## 🔐 Prístup do CMS

1. **URL:** `https://your-site.com/cms.html` (alebo local: `http://localhost:8080/cms.html`)
2. **Prihlásenie:** Zadajte užívateľské meno a heslo
3. **Session:** Automatické odhlásenie po 8 hodinách nečinnosti

## 🎛️ Funkcie CMS

### Galéria (homepage carousel + galéria stránka)
- ✅ Pridávanie obrázkov cez URL
- ✅ Mazanie existujúcich obrázkov
- ✅ Realtime updates na webe

### Menu obrázky (menu stránka)  
- ✅ Pridávanie menu obrázkov cez URL
- ✅ Mazanie menu obrázkov
- ✅ Realtime updates na menu stránke

### Stav hospody
- ✅ Prepínanie Otvorené/Zatvorené
- ✅ Realtime aktualizácia status badge na webe

## 🔧 Správa užívateľov (cez SQL)

### Vytvorenie nového užívateľa:
```sql
INSERT INTO public.cms_users (username, password_hash, email, full_name) VALUES 
('novy_user', crypt('jeho_heslo', gen_salt('bf')), 'email@example.com', 'Meno Priezvisko');
```

### Zmena hesla:
```sql
UPDATE public.cms_users 
SET password_hash = crypt('nove_heslo', gen_salt('bf')) 
WHERE username = 'admin';
```

### Deaktivácia užívateľa:
```sql
UPDATE public.cms_users SET is_active = false WHERE username = 'username';
```

### Zmazanie užívateľa:
```sql
DELETE FROM public.cms_users WHERE username = 'username';
```

## 🛡️ Bezpečnosť

- **Bcrypt hash** - heslá sú bezpečne hashované
- **RLS políciess** - prístup len cez service_role
- **Session timeout** - automatické odhlásenie  
- **Input validation** - validácia všetkých vstupov
- **HTTPS recommended** - používajte HTTPS v produkcii

## 📋 Databázové tabuľky

CMS pracuje s týmito tabuľkami:
- `cms_users` - admin užívatelia  
- `gallery` - obrázky pre galériu a homepage
- `menu_images` - obrázky pre menu stránku
- `site_status` - stav hospody (otvorené/zatvorené)

## 🚀 Deployment

1. Nahrajte všetky súbory na server
2. Nastavte Supabase config v `supabase-config.js`
3. Spustite SQL schémy
4. Vytvorte admin užívateľov  
5. CMS bude dostupné na `/cms.html`

## 📞 Podpora

V prípade problémov skontrolujte:
- Developer Console pre JavaScript chyby
- Supabase logs pre databázové chyby  
- Správnosť RLS policies
- Platnosť service_role kľúča