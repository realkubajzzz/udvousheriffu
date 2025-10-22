# CMS Prihlasovacie údaje

## 👥 Používatelia

### 🔐 **Admin používateľ:**
- **Používateľské meno:** `admin`
- **Heslo:** `admin123`
- **Rola:** Administrator (plný prístup)
- **Email:** admin@udvousheriffu.sk

### ✏️ **Editor používateľ:**
- **Používateľské meno:** `editor` 
- **Heslo:** `editor456`
- **Rola:** Editor (plný prístup k obsahu)
- **Email:** editor@udvousheriffu.sk

## 🚨 Bezpečnostné upozornenie

**⚠️ DÔLEŽITÉ: Zmeňte tieto default heslá okamžite po prvom prihlásení!**

### Zmena hesla:
1. Prihláste sa do CMS
2. V Supabase SQL Editore spustite:
```sql
-- Zmena hesla pre admin
UPDATE public.cms_users 
SET password_hash = '$2b$10$NOVY_BCRYPT_HASH' 
WHERE username = 'admin';

-- Zmena hesla pre editor  
UPDATE public.cms_users 
SET password_hash = '$2b$10$NOVY_BCRYPT_HASH' 
WHERE username = 'editor';
```

### Generovanie bcrypt hash:
Použite online bcrypt generátor alebo Node.js:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('nove_heslo', 10);
console.log(hash);
```

## 🔑 Prístup k CMS

### Login URL:
```
https://váš-web.sk/logincms.html
```

### Dashboard URL:
```
https://váš-web.sk/cms.html
```

## 👤 Rozdiely medzi rolami

**Admin vs Editor:**
- Oba majú momentálne rovnaké oprávnenia
- Pripravené pre budúce rozšírenia (napr. len admin môže mazať používateľov)
- Editor má rovnaký prístup k všetkým CMS funkciám

## 📝 Poznámky

- Oba používatelia môžu spravovať galériu, menu a akcie
- Session trvá 24 hodín
- Automatické odhlásenie po vypršaní session
- Bezpečné session tokeny s čistením expired sessions