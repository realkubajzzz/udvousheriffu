#!/bin/bash

# Translate main files to Slovak

main_files=(
    "sk-index.html"
    "sk-menu.html" 
    "sk-akcie.html"
    "sk-rezervace.html"
    "sk-galeria.html"
    "sk-recenzie.html"
    "sk-about.html"
    "sk-kontakt.html"
)

echo "Translating to Slovak..."

for file in "${main_files[@]}"; do
    if [ -f "$file" ]; then
        echo "Translating $file..."
        
        # Navigation translations to Slovak
        sed -i.tmp 's|>Domů<|>Domov<|g' "$file"
        sed -i.tmp 's|>Akce<|>Akcie<|g' "$file"
        sed -i.tmp 's|>Rezervace<|>Rezervácie<|g' "$file"
        sed -i.tmp 's|>Recenze<|>Recenzie<|g' "$file"
        sed -i.tmp 's|>Galerie<|>Galéria<|g' "$file"
        
        # Update hrefs to Slovak versions
        sed -i.tmp 's|href="index\.html"|href="sk-index.html"|g' "$file"
        sed -i.tmp 's|href="menu\.html"|href="sk-menu.html"|g' "$file"
        sed -i.tmp 's|href="akcie\.html"|href="sk-akcie.html"|g' "$file"
        sed -i.tmp 's|href="rezervace\.html"|href="sk-rezervace.html"|g' "$file"
        sed -i.tmp 's|href="galeria\.html"|href="sk-galeria.html"|g' "$file"
        sed -i.tmp 's|href="recenzie\.html"|href="sk-recenzie.html"|g' "$file"
        sed -i.tmp 's|href="about\.html"|href="sk-about.html"|g' "$file"
        sed -i.tmp 's|href="kontakt\.html"|href="sk-kontakt.html"|g' "$file"
        
        # Content translations
        sed -i.tmp 's|Načítám|Načítavam|g' "$file"
        sed -i.tmp 's|Zde|Tam|g' "$file"
        sed -i.tmp 's|Telefon:|Telefón:|g' "$file"
        sed -i.tmp 's|Události|Udalosti|g' "$file"
        
        # Clean up
        rm "$file.tmp" 2>/dev/null || true
        
        echo "Translated $file"
    fi
done

echo "Done! All Slovak files created and translated."