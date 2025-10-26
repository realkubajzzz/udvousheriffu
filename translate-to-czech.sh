#!/bin/bash

# Translate navigation and common texts to Czech in all HTML files

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

echo "Translating to Czech..."

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Translating $file..."
        
        # Navigation translations
        sed -i.tmp 's|>Domov<|>Domů<|g' "$file"
        sed -i.tmp 's|>Akcie<|>Akce<|g' "$file"
        sed -i.tmp 's|>Rezervacie<|>Rezervace<|g' "$file"
        sed -i.tmp 's|>Recenzie<|>Recenze<|g' "$file"
        
        # Common text translations
        sed -i.tmp 's|Načítavam|Načítám|g' "$file"
        sed -i.tmp 's|naši hosté|hosté|g' "$file"
        
        # Clean up
        rm "$file.tmp" 2>/dev/null || true
        
        echo "Translated $file"
    fi
done

echo "Done! All files translated to Czech."