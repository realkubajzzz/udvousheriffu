#!/usr/bin/env python3
"""
Small generator that injects <img> tags into galeria.html and index.html
between markers. Use if Node isn't available.
Run: python3 scripts/generate_galleries.py
"""
import os
from pathlib import Path

root = Path(__file__).resolve().parent.parent
gallery_dir = root / 'assets' / 'images' / 'gallery'
home_dir = root / 'assets' / 'images' / 'home'

gal_html = root / 'galeria.html'
index_html = root / 'index.html'

def make_imgs(dirpath, webprefix):
    if not dirpath.exists():
        return []
    files = [f for f in sorted(dirpath.iterdir()) if f.suffix.lower() in ['.jpg','.jpeg','.png','.gif','.webp']]
    return [f"{webprefix}/{f.name}" for f in files]

def inject(file_path, start_marker, end_marker, items_html):
    s = file_path.read_text(encoding='utf8')
    si = s.find(start_marker)
    ei = s.find(end_marker, si)
    if si == -1 or ei == -1:
        print(f"Markers not found in {file_path}")
        return
    before = s[:si+len(start_marker)]
    after = s[ei:]
    new = before + '\n' + '\n'.join(items_html) + '\n' + after
    file_path.write_text(new, encoding='utf8')
    print(f"Updated {file_path}")


gallery_imgs = make_imgs(gallery_dir, '/assets/images/gallery')
home_imgs = make_imgs(home_dir, '/assets/images/home')

gallery_html = [f'          <img src="{src}" alt="Galerie {i+1}">' for i,src in enumerate(gallery_imgs)]
home_html = [f'            <img src="{src}" alt="Momentka {i+1}">' for i,src in enumerate(home_imgs)]

inject(gal_html, '<!-- GALLERY:START -->', '<!-- GALLERY:END -->', gallery_html if gallery_html else ['          <!-- no images found -->'])
inject(index_html, '<!-- HOMEGALLERY:START -->', '<!-- HOMEGALLERY:END -->', home_html if home_html else ['            <!-- no images found -->'])

print('Done')
