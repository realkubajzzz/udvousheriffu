# 🎯 CMS Akcie - Kompletné nastavenie

## 📋 Prehľad
Systém pre správu akcií v CMS U Dvou Šerifů umožňuje:
- ➕ **Pridávanie akcií** cez CMS
- ✏️ **Editovanie akcií** 
- 🖼️ **Upload obrázkov** priamo zo zariadenia
- 📅 **Nastavenie dátumov** (od-do)
- 🔄 **Aktivácia/deaktivácia** akcií
- 📱 **Zobrazenie na webstránkach** (index.html, akcie.html)

---

## 🛠️ Inštalácia

### 1. **Vytvorte tabuľku v databáze**
```sql
-- Spustite súbor create-actions-table.sql v Supabase SQL Editor
-- Tento súbor vytvorí tabuľku cms_actions s všetkými potrebnými nastaveniami
```

### 2. **Overenie inštalácie**
- Otvorte `test-actions-table.html` v prehliadači
- Malo by zobraziť ✅ úspešné testy a 3 ukážkové akcie

---

## 📊 Štruktúra tabuľky `cms_actions`

| Stĺpec | Typ | Popis |
|--------|-----|-------|
| `id` | UUID | Jedinečný identifikátor (auto) |
| `title` | TEXT | **Názov akcie** (povinné) |
| `description` | TEXT | Popis akcie (voliteľné) |
| `image_url` | TEXT | URL obrázka (voliteľné) |
| `is_active` | BOOLEAN | Aktívna/neaktívna (default: true) |
| `start_date` | DATE | Dátum začiatku (voliteľné) |
| `end_date` | DATE | Dátum konca (voliteľné) |
| `sort_order` | INTEGER | Poradie zobrazenia (default: 0) |
| `created_at` | TIMESTAMP | Čas vytvorenia (auto) |
| `updated_at` | TIMESTAMP | Čas úpravy (auto) |

---

## 💻 Použitie CMS

### **Pridanie novej akcie:**
1. Otvorte CMS (`cms.html`)
2. Prejdite na záložku **"Akcie"**
3. Vyplňte formulár:
   - **Názov akcie** (povinné)
   - **Popis** (voliteľné)
   - **Obrázok** - môžete nahrať súbor alebo vložiť URL
   - **Dátum začiatku/konca** (voliteľné)
4. Kliknite **"Pridať akciu"**

### **Editácia existujúcej akcie:**
1. V zozname akcií kliknite **"Editovať"**
2. Upravte údaje vo formulári  
3. Kliknite **"Aktualizovať akciu"**

### **Správa akcií:**
- **Aktivovať/Deaktivovať** - ovláda či sa akcia zobrazí na webstránke
- **Zmazať** - permanentne odstráni akciu
- **Drag & Drop** - zmena poradia akcií

---

## 🌐 Zobrazenie na webstránkach

### **Index.html (Domovská stránka):**
- Zobrazuje **max 3 aktívne akcie**
- **Horizontálny dizajn** s obrázkom na ľavo
- Sekcia: "Aktuální akce"

### **Akcie.html (Stránka akcií):**
- Zobrazuje **všetky aktívne akcie**
- **Vertikálny card dizajn** s obrázkom hore
- **Grid layout** - responzívny

---

## 🎨 Dizajn a štýly

### **Homepage akcie** (`.action-card-home`):
```css
- Horizontálne karty
- Obrázok: 120x120px na ľavo (desktop) / 100% šírka (mobile)
- Apple-štýl s jemnými tieňmi
- Hover efekty s animáciou
```

### **Akcie stránka** (`.action-card`):
```css
- Vertikálne karty v grid-e
- Obrázok: 100% šírka, 220px výška
- Dátum badge s accent farbou
- Responzívny grid layout
```

---

## 🔧 Technické detaily

### **RLS (Row Level Security):**
- **Anonymní užívatelia** - môžu čítať len aktívne akcie
- **Authentifikovaní** - môžu čítať/upravovať všetky akcie

### **Upload obrázkov:**
- **Imgur API** - automatický upload na cloud
- **Podporované formáty** - JPG, PNG, WebP
- **Maximálna veľkosť** - 10MB

### **Realtime updates:**
- **Supabase subscriptions** - zmeny sa okamžite prejavia
- **Automatické refresh** CMS pri zmenách

---

## 🚀 Testovanie

### **1. Test tabuľky:**
```bash
# Otvorte test-actions-table.html
# Malo by zobraziť úspešné testy
```

### **2. Test CMS:**
```bash
# Otvorte cms.html
# Skúste pridať/upraviť akciu
```

### **3. Test webstránok:**
```bash  
# Otvorte index.html a akcie.html
# Mali by sa zobraziť akcie z databázy
```

---

## 📝 Príklad použitia

```javascript
// Akcia z databázy bude vyzerať:
{
  id: "uuid-string",
  title: "Večer so šerifom", 
  description: "Špecialny tematický večer...",
  image_url: "https://imgur.com/abc123.jpg",
  is_active: true,
  start_date: "2024-11-15",
  end_date: "2024-11-15",
  sort_order: 1
}
```

---

## ✅ Checklist po inštalácii

- [ ] Spustený `create-actions-table.sql` v Supabase
- [ ] Test `test-actions-table.html` ukázal úspech  
- [ ] CMS zobrazuje záložku "Akcie" a formulár
- [ ] Akcie sa zobrazujú na `index.html`
- [ ] Akcie sa zobrazujú na `akcie.html`
- [ ] Upload obrázkov funguje v CMS