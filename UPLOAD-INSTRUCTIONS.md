# ZOZNAM SÚBOROV PRE UPLOAD NA INFINITYFREE

## HLAVNÉ SÚBORY (nahrajte do htdocs/):
✅ index.html (POVINNÝ!)
✅ .htaccess (pre clean URLs)

## ČESKÉ STRÁNKY:
✅ menu.html
✅ akcie.html  
✅ rezervace.html
✅ galeria.html
✅ recenzie.html
✅ about.html
✅ kontakt.html

## SLOVENSKÉ STRÁNKY:
✅ sk-index.html
✅ sk-menu.html
✅ sk-akcie.html
✅ sk-rezervace.html
✅ sk-galeria.html
✅ sk-recenzie.html
✅ sk-about.html
✅ sk-kontakt.html

## PRIEČINKY:
✅ assets/ (celý priečinok)
✅ styles/ (celý priečinok)
✅ scripts/ (celý priečinok)
✅ redirects/ (celý priečinok)

## KONFIGURAČNÉ SÚBORY:
✅ supabase-config.js

## NENAHRAJTE:
❌ *.backup súbory
❌ *.sh skripty
❌ .git/ priečinok
❌ test-* súbory
❌ debug-* súbory
❌ *.md súbory

---

## POSTUP PRE INFINITYFREE:

1. **Prihláste sa do Control Panel**
2. **Otvorte File Manager**  
3. **Prejdite do htdocs/ priečinka**
4. **Nahrajte VŠETKY súbory zo zoznamu vyššie**
5. **Skontrolujte, že index.html je v htdocs/ (nie v podpriečinku!)**

## ŠTRUKTÚRA NA SERVERI:
```
htdocs/
├── index.html          ← MUSÍ BYŤ TU!
├── .htaccess
├── menu.html
├── sk-index.html
├── assets/
│   ├── logo.png
│   └── team/
├── styles/
│   └── styles.css
└── scripts/
    └── main.js
```

## URL PO UPLOADE:
- http://yourdomain.infinityfree.net/
- http://yourdomain.infinityfree.net/menu
- http://yourdomain.infinityfree.net/sk-menu
