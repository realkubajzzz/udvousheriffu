# CMS Aktualizácia: Krátky text a časy pre akcie

## Prehľad zmien

Pridali sme nové funkcie do CMS:
1. **Krátky text pre homepage** - alternatíva k dlhému popisu
2. **Voliteľné časy** - možnosť pridať čas začiatku a konca akcie

## Nové funkcie

### 1. Nové polia v CMS
- **Krátky text pre homepage** - povinné pole s max. 120 znakmi
- **Character counter** - zobrazuje počet znakov a mení farbu podľa dĺžky
- **Časy akcií** - voliteľné polia pre čas začiatku a konca (formát HH:MM)
- **Toggle button** - na zapnutie/vypnutie časových polí

### 2. Zobrazenie v CMS
- Karty akcií zobrazujú:
  - **Homepage text** - krátky text pre úvodnú stránku
  - **Detailný popis** - pôvodný dlhý popis pre stránku akcií
  - **Dátumy** - s ikonkou 📅
  - **Časy** - s ikonkou ⏰ (ak sú nastavené)

### 3. Frontend zobrazenie
- Index stránka používa `short_text` namiesto `description`
- Časy sa zobrazujú vo formáte "dátum • čas"
- Fallback na `description` ak `short_text` nie je dostupný

## Databázové zmeny

Spustite SQL scripty v Supabase:

```sql
-- Pridanie short_text kolónky
ALTER TABLE cms_actions ADD COLUMN short_text TEXT;
ALTER TABLE cms_actions ADD CONSTRAINT short_text_length_check CHECK (LENGTH(short_text) <= 120);

-- Pridanie time kolónok
ALTER TABLE cms_actions ADD COLUMN start_time TIME;
ALTER TABLE cms_actions ADD COLUMN end_time TIME;
```

## Príklady použitia

### S časmi:
- **Dátum**: 27.10.2025
- **Čas**: 18:00 - 22:00
- **Zobrazenie**: "27.10.2025 • 18:00 - 22:00"

### Bez časov:
- **Dátum**: 27.10.2025 - 30.10.2025
- **Zobrazenie**: "27.10.2025 - 30.10.2025"

## Testovanie

1. Otvorte CMS a pridajte novú akciu
2. Vyplňte povinné polia
3. Kliknite "⏰ Pridať časy (voliteľné)"
4. Nastavte časy (default: 09:00 - 22:00)
5. Skontrolujte zobrazenie na homepage

## Podporné súbory

- `cms.html` - aktualizovaný formulár s časmi
- `scripts/cms.js` - aktualizované funkcie
- `scripts/main.js` - aktualizované zobrazenie na homepage
- `styles/styles-cms.css` - nové štýly
- `add-short-text-column.sql` - databázová migrácia pre text
- `add-time-columns.sql` - databázová migrácia pre časy

## Doporučenia pre obsah

### Krátky text (homepage):
- **Dĺžka**: 80-120 znakov
- **Účel**: Prilákať návštevníkov na homepage
- **Štýl**: Výstižný, marketingový
- **Príklad**: "Špeciálne menu s tradičnými jedlami za skvelé ceny. Len do konca mesiaca!"

### Detailný popis (stránka akcií):
- **Dĺžka**: Bez limitu
- **Účel**: Poskytnutí všetkých informácií
- **Štýl**: Podrobný, informatívny
- **Príklad**: "Naša kuchyňa pripravila špeciálne menu s tradičnými jedlami..."

## Testovanie

1. Otvorte CMS a pridajte novú akciu
2. Vyplňte krátky text (max 120 znakov)
3. Vyplňte detailný popis
4. Skontrolujte character counter
5. Uložte a skontrolujte zobrazenie na homepage

## Podporné súbory

- `cms.html` - aktualizovaný formulár
- `scripts/cms.js` - aktualizované funkcie
- `scripts/main.js` - aktualizované zobrazenie na homepage
- `styles/styles-cms.css` - nové štýly pre action-texts
- `add-short-text-column.sql` - databázová migrácia

## Kompatibilita

- Existujúce akcie zostanú funkčné
- Homepage zobrazí `description` ak `short_text` nie je dostupný
- CMS validácia zabráni uloženiu prázdnych akcií