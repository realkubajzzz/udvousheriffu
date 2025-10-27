#!/bin/bash

# Script to restore .html extensions for localhost testing
# Includes both Czech and Slovak versions

echo "Restoring .html extensions for localhost testing..."

# List of ALL HTML files to update (Czech and Slovak)
files=(
    "index.html"
    "menu.html" 
    "akcie.html"
    "rezervace.html"
    "galeria.html"
    "recenzie.html"
    "about.html"
    "kontakt.html"
    "sk-index.html"
    "sk-menu.html"
    "sk-akcie.html"
    "sk-rezervace.html"
    "sk-galeria.html"
    "sk-recenzie.html"
    "sk-about.html"
    "sk-kontakt.html"
)

# Update each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Check if it's a Slovak file
        if [[ $file == sk-* ]]; then
            # Slovak files - restore .html extensions to Slovak links
            sed -i.tmp 's/href="\/sk-index"/href="sk-index.html"/g' "$file"
            sed -i.tmp 's/href="\/sk-menu"/href="sk-menu.html"/g' "$file"
            sed -i.tmp 's/href="\/sk-akcie"/href="sk-akcie.html"/g' "$file"
            sed -i.tmp 's/href="\/sk-rezervace"/href="sk-rezervace.html"/g' "$file"
            sed -i.tmp 's/href="\/sk-galeria"/href="sk-galeria.html"/g' "$file"
            sed -i.tmp 's/href="\/sk-recenzie"/href="sk-recenzie.html"/g' "$file"
            sed -i.tmp 's/href="\/sk-about"/href="sk-about.html"/g' "$file"
            sed -i.tmp 's/href="\/sk-kontakt"/href="sk-kontakt.html"/g' "$file"
            
            # Language switcher links
            sed -i.tmp 's/href="\/"/href="index.html"/g' "$file"
        else
            # Czech files - restore .html extensions to Czech links
            sed -i.tmp 's/href="\/"*/href="index.html"/g' "$file"
            sed -i.tmp 's/href="\/menu"/href="menu.html"/g' "$file"
            sed -i.tmp 's/href="\/akcie"/href="akcie.html"/g' "$file"
            sed -i.tmp 's/href="\/rezervace"/href="rezervace.html"/g' "$file"
            sed -i.tmp 's/href="\/galeria"/href="galeria.html"/g' "$file"
            sed -i.tmp 's/href="\/recenzie"/href="recenzie.html"/g' "$file"
            sed -i.tmp 's/href="\/about"/href="about.html"/g' "$file"
            sed -i.tmp 's/href="\/kontakt"/href="kontakt.html"/g' "$file"
        fi
        
        # Clean up temporary files
        rm "$file.tmp" 2>/dev/null || true
        
        echo "Updated $file"
    else
        echo "File $file not found, skipping..."
    fi
done

echo "Done! Restored .html extensions for localhost testing."
echo "Now you can test both Czech and Slovak versions on localhost!"
echo "Remember to run remove-html-complete.sh again before uploading to production!"