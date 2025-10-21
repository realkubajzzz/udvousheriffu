# Gallery generator

Place images into the following folders:

- `assets/images/gallery` — images for `galeria.html` page
- `assets/images/home` — images for the homepage carousel

Then run:

```bash
node scripts/generate_galleries.js
```

This will update `galeria.html` and `index.html` by inserting `<img>` tags between the marker comments:

- `<!-- GALLERY:START -->` / `<!-- GALLERY:END -->` in `galeria.html`
- `<!-- HOMEGALLERY:START -->` / `<!-- HOMEGALLERY:END -->` in `index.html`

Notes:
- The script only includes files with extensions jpg, jpeg, png, gif, webp.
- It overwrites the HTML files in-place (it is safe for the current layout markers).
