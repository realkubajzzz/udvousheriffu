#!/bin/bash

# Better script to remove .html extensions without breaking HTML syntax

files=(
    "index.html"
    "menu.html" 
    "akcie.html"
    "rezervace.html"
    "galeria.html"
    "recenzie.html"
    "about.html"
    "kontakt.html"
)

echo "Carefully updating HTML files..."

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Use more precise patterns to avoid breaking HTML
        sed -i.tmp 's|href="index\.html"|href="/"|g' "$file"
        sed -i.tmp 's|href="menu\.html"|href="/menu"|g' "$file"
        sed -i.tmp 's|href="akcie\.html"|href="/akcie"|g' "$file"
        sed -i.tmp 's|href="rezervace\.html"|href="/rezervace"|g' "$file"
        sed -i.tmp 's|href="galeria\.html"|href="/galeria"|g' "$file"
        sed -i.tmp 's|href="recenzie\.html"|href="/recenzie"|g' "$file"
        sed -i.tmp 's|href="about\.html"|href="/about"|g' "$file"
        sed -i.tmp 's|href="kontakt\.html"|href="/kontakt"|g' "$file"
        
        # Clean up
        rm "$file.tmp" 2>/dev/null || true
        
        echo "Updated $file safely"
    fi
done

echo "Done! All files updated safely."