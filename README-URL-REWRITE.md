# Odstránenie .html extensions z URL adries

## Čo bolo urobené

1. **Vytvorený `.htaccess` súbor** - obsahuje URL rewrite pravidlá pre Apache server
2. **Upravené všetky HTML súbory** - interné odkazy teraz používajú clean URLs bez `.html`
3. **Upravený JavaScript** - redirect na akcije používa `/akcie` namiesto `akcie.html`

## Ako to funguje

### .htaccess pravidlá:
- **External redirect**: `/file.html` → `/file` (301 redirect)
- **Internal rewrite**: `/file` → `/file.html` (server internally načíta HTML súbor)

### Príklady transformácie URL:
- `https://yourdomain.com/index.html` → `https://yourdomain.com/`
- `https://yourdomain.com/galeria.html` → `https://yourdomain.com/galeria`
- `https://yourdomain.com/menu.html` → `https://yourdomain.com/menu`

## Inštalácia na InfinityFree

1. **Upload súborov na server:**
   - Nahrajte `.htaccess` súbor do root priečinka vašej stránky
   - Nahrajte všetky upravené HTML súbory

2. **Testovanie:**
   - Otvorte `https://yourdomain.com/galeria` (bez .html)
   - Skontrolujte či všetky odkazy fungujú správne
   - Staré URLs s `.html` by sa mali automaticky presmerovať

## Výhody

✅ **Profesionálnejšie URL adresy** bez `.html` koncoviek
✅ **SEO friendly** - clean URLs sú lepšie pre vyhľadávače  
✅ **Automatické presmerovanie** starých URL s `.html`
✅ **Zachovaná funkčnosť** všetkých odkazov
✅ **Optimalizácia** - pridané cache headers a kompresia

## Záložné súbory

Všetky originálne HTML súbory boli zálohované s príponou `.backup`:
- `index.html.backup`
- `menu.html.backup` 
- `akcie.html.backup`
- atď.

V prípade problémov môžete obnoviť originálne súbory.

## Poznámky pre InfinityFree

InfinityFree hosting podporuje `.htaccess` súbory, takže toto riešenie by malo fungovať bez problémov. Ak sa vyskytnú problémy:

1. Skontrolujte či je `.htaccess` súbor správne nahraný
2. Uistite sa že súbor nemá príponu (nie `.htaccess.txt`)
3. Skontrolujte file permissions (.htaccess by mal mať 644)