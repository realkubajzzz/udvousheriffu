# CMS Systém pre U Dvou Sheriffů

## 📋 Prehľad

Kompletný Content Management System pre správu obsahu webu U Dvou Sheriffů s bezpečným prihlasovaním a administráciou cez Supabase databázu.

## 🚀 Inštalácia

### 1. Spustite SQL v Supabase

```sql
-- Skopírujte a spustite obsah súboru bot/cms-schema.sql v Supabase SQL Editor
```

**Dôležité:** SQL automaticky vytvorí admin používateľa:
- **Používateľské meno:** `admin`
- **Heslo:** `admin123`
- **⚠️ ZMEŇTE HESLO PO PRVOM PRIHLÁSENÍ!**

### 2. Prístup k CMS

#### Login stránka:
```
https://váš-web.sk/logincms.html
```

#### CMS Dashboard:
```
https://váš-web.sk/cms.html
```
*(Presmeruje na login ak nie ste prihlásení)*

## 🔧 Funkcionalita

### 🎨 **Správa Galérie**
- Pridávanie obrázkov do hlavnej galérie (`galeria.html`)
- Obrázky sa zobrazia aj v carousel na `index.html` (max 15)
- URL input - nahrajte na Imgur/Cloudinary a vložte link
- Realtime updates - nové obrázky sa objavia okamžite

### 🍽️ **Správa Menu Obrázkov**
- Pridávanie obrázkov do menu sekcie (`menu.html`)
- Portrait formát obrázkov (1080x1920)
- Caption pre názov jedla
- Mazanie starých obrázkov

### 🎉 **Správa Akcií**
- Vytváracie špeciálnych ponúk a akcií
- Názov, popis, obrázok, dátumové rozpätie
- Aktivovanie/deaktivovanie akcií
- Pripravené pre integráciu na `akcie.html`

## 🔐 Bezpečnosť

### **Session Management:**
- 24-hodinové sessions s automatickým vypršaním
- Bezpečné session tokeny
- Automatické čistenie expired sessions

### **Database Security:**
- Row Level Security (RLS) policies
- Authenticated prístup pre CMS operácie
- Public read prístup pre web stránky

### **Password Security:**
- Bcrypt hashing pre heslá
- Secure session storage

## 📊 Database Schema

### **Tabuľky:**
- `cms_users` - CMS používatelia
- `cms_sessions` - Aktívne sessions
- `cms_actions` - Správa akcií
- `gallery` - Galéria obrázkov (rozšírená o CMS tracking)
- `menu_images` - Menu obrázky (rozšírená o CMS tracking)

## 🎯 Použitie

### **Prvé prihlásenie:**
1. Idite na `/logincms.html`
2. Prihlaste sa ako `admin` / `admin123`
3. Okamžite zmeňte heslo v databáze!

### **Pridávanie obsahu:**
1. **Galéria:** URL → Caption → Pridať
2. **Menu:** URL → Názov jedla → Pridať  
3. **Akcie:** Vyplňte formulár → Pridať akciu

### **Správa obsahu:**
- Všetky položky majú Delete tlačidlo
- Akcie sa dajú aktivovať/deaktivovať
- Realtime updates na web stránkach

## 🔄 Integrácia s Web Stránkami

CMS je už integrované s existujúcimi stránkami:

- ✅ **Galéria** (`galeria.html`) - automaticky načíta z `gallery` tabuľky
- ✅ **Menu** (`menu.html`) - automaticky načíta z `menu_images` tabuľky  
- ✅ **Homepage carousel** (`index.html`) - načíta max 15 z `gallery`
- 🔄 **Akcie** (`akcie.html`) - pripravené pre integráciu s `cms_actions`

## 🛠️ Technické detaily

### **Frontend:**
- Vanilla JavaScript (ES6+)
- Responsive CSS Grid/Flexbox
- Real-time UI updates

### **Backend:**
- Supabase PostgreSQL databáza
- Row Level Security policies
- Automatic triggers pre updated_at

### **API:**
- Supabase JavaScript client
- RESTful CRUD operácie
- Real-time subscriptions

## 🔒 Bezpečnostné odporúčania

1. **Zmeňte default heslo** okamžite po inštalácii
2. **Používajte HTTPS** v produkcii
3. **Pravidelne zálohujte** databázu
4. **Monitorujte** CMS aktivity
5. **Aktualizujte** Supabase kľúče ak je potreba

## 🆘 Troubleshooting

### **Problém s prihlásením:**
- Skontrolujte Supabase konfiguráciu v `supabase-config.js`
- Overte, že SQL schéma bola správne spustená
- Skontrolujte konzolu prehliadača pre chyby

### **Obrázky sa nezobrazujú:**
- Overte, že URL obrázkov sú platné a verejne prístupné
- Skontrolujte CORS nastavenia obrázkov
- Použite Imgur alebo Cloudinary pre spoľahlivé hosting

### **Session problémy:**
- Vymazať localStorage v prehliadači
- Skontrolovať `cms_sessions` tabuľku v databáze
- Overte system čas servera vs. klienta

## 📈 Rozšírenia

CMS je pripravený na ďalšie rozšírenia:
- 📝 **Správa textového obsahu**
- 👥 **Viacero admin používateľov** 
- 📊 **Analytics a štatistiky**
- 🔔 **Email notifikácie**
- 📱 **Mobile optimalizácia**
