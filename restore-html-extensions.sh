#!/bin/bash

# Script to restore .html extensions for localhost testing
# This reverses the changes made by remove-html-extensions.sh

# List of HTML files to update
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

echo "Restoring .html extensions for localhost testing..."

# Update each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Restore .html extensions
        sed -i.tmp 's/href="\/"*/href="index.html"/g' "$file"
        sed -i.tmp 's/href="\/menu"/href="menu.html"/g' "$file"
        sed -i.tmp 's/href="\/akcie"/href="akcie.html"/g' "$file"
        sed -i.tmp 's/href="\/rezervace"/href="rezervace.html"/g' "$file"
        sed -i.tmp 's/href="\/galeria"/href="galeria.html"/g' "$file"
        sed -i.tmp 's/href="\/recenzie"/href="recenzie.html"/g' "$file"
        sed -i.tmp 's/href="\/about"/href="about.html"/g' "$file"
        sed -i.tmp 's/href="\/kontakt"/href="kontakt.html"/g' "$file"
        
        # Clean up temporary files
        rm "$file.tmp" 2>/dev/null || true
        
        echo "Updated $file"
    else
        echo "File $file not found, skipping..."
    fi
done

echo "Done! Restored .html extensions for localhost testing."
echo "Remember to run remove-html-extensions.sh again before uploading to production!"