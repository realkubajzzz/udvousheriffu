#!/bin/bash

# Fix localhost URLs by adding .html extensions back

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

echo "Adding .html extensions for localhost..."

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Fixing $file..."
        
        # Fix navigation links
        sed -i.tmp 's|href="/"|href="index.html"|g' "$file"
        sed -i.tmp 's|href="/menu"|href="menu.html"|g' "$file"
        sed -i.tmp 's|href="/akcie"|href="akcie.html"|g' "$file"
        sed -i.tmp 's|href="/rezervace"|href="rezervace.html"|g' "$file"
        sed -i.tmp 's|href="/galeria"|href="galeria.html"|g' "$file"
        sed -i.tmp 's|href="/recenzie"|href="recenzie.html"|g' "$file"
        sed -i.tmp 's|href="/about"|href="about.html"|g' "$file"
        sed -i.tmp 's|href="/kontakt"|href="kontakt.html"|g' "$file"
        
        # Clean up
        rm "$file.tmp" 2>/dev/null || true
        
        echo "Fixed $file"
    fi
done

echo "Done! All files now have .html extensions for localhost."