#!/bin/bash

# Script to remove .html extensions from internal links in all HTML files
# Run this in the root directory of your website

# List of main HTML files to update
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

# Backup original files
echo "Creating backups..."
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$file.backup"
        echo "Backed up $file"
    fi
done

echo "Updating HTML files..."

# Update each file
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "Updating $file..."
        
        # Update brand links
        sed -i.tmp 's/href="index\.html"/href="\/"/g' "$file"
        
        # Update navigation links
        sed -i.tmp 's/href="menu\.html"/href="\/menu"/g' "$file"
        sed -i.tmp 's/href="akcie\.html"/href="\/akcie"/g' "$file"
        sed -i.tmp 's/href="rezervace\.html"/href="\/rezervace"/g' "$file"
        sed -i.tmp 's/href="galeria\.html"/href="\/galeria"/g' "$file"
        sed -i.tmp 's/href="recenzie\.html"/href="\/recenzie"/g' "$file"
        sed -i.tmp 's/href="about\.html"/href="\/about"/g' "$file"
        sed -i.tmp 's/href="kontakt\.html"/href="\/kontakt"/g' "$file"
        
        # Clean up temporary files
        rm "$file.tmp" 2>/dev/null || true
        
        echo "Updated $file"
    else
        echo "File $file not found, skipping..."
    fi
done

echo "Done! All internal links updated to remove .html extensions."
echo "Don't forget to:"
echo "1. Upload the .htaccess file to your web server"
echo "2. Test all links after uploading"
echo "3. Update any hardcoded links in JavaScript files if needed"