#!/bin/bash

# Add version parameter to CSS files to force cache refresh

# Current timestamp for version
VERSION=$(date +%Y%m%d%H%M%S)

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

echo "Adding version $VERSION to CSS files..."

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Add version parameter to styles.css
        sed -i.tmp "s|href=\"styles/styles\.css\"|href=\"styles/styles.css?v=$VERSION\"|g" "$file"
        
        # Clean up
        rm "$file.tmp" 2>/dev/null || true
        
        echo "Updated $file with version $VERSION"
    fi
done

echo "Done! All CSS files now have version parameter v=$VERSION"
echo "This will force browsers to reload the CSS file."