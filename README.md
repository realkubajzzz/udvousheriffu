# U Dvou Sheriffů — static website

This is a small static website mockup for the restaurant "U Dvou Sheriffů". It's intentionally database-free and uses a clean, Apple-like design with subtle animations.

What is included
- `index.html`, `menu.html`, `akcie.html`, `kontakt.html`, `about.html`, `rezervace.html` — pages
- `styles/styles.css` — main stylesheet
- `scripts/main.js` — small JS for mobile nav and reveal animations

How to view locally

1. Open `index.html` in your browser directly (double-click), or
2. Serve with a simple static server (recommended) — from the project folder run:

```
python3 -m http.server 8000
```

then open `http://localhost:8000` in your browser.

Customizations and notes
- No backend: contact form is a frontend stub and doesn't send messages.
- Replace placeholder content (address, phone, menu items) with real data.
- The design uses system fonts for an Apple-like look.
- For production, minify CSS/JS and add images for hero/media placeholders.

If you'd like, I can:
- Add real images and responsive picture handling.
- Convert to a small single-page app or a simple static-site generator setup.
- Generate print-friendly menu or a PDF export for download.
