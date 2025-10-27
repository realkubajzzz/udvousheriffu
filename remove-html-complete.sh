#!/bin/bash

# Complete script to remove .html extensions from internal links in ALL HTML files
# Includes both Czech and Slovak versions
# Run this in the root directory of your website

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
        
        # Update brand links - Czech files
        if [[ $file != sk-* ]]; then
            sed -i.tmp 's/href="index\.html"/href="\/"/g' "$file"
        else
            # Slovak files keep sk-index as home
            sed -i.tmp 's/href="sk-index\.html"/href="\/sk-index"/g' "$file"
        fi
        
        # Update navigation links - Czech files
        if [[ $file != sk-* ]]; then
            sed -i.tmp 's/href="menu\.html"/href="\/menu"/g' "$file"
            sed -i.tmp 's/href="akcie\.html"/href="\/akcie"/g' "$file"
            sed -i.tmp 's/href="rezervace\.html"/href="\/rezervace"/g' "$file"
            sed -i.tmp 's/href="galeria\.html"/href="\/galeria"/g' "$file"
            sed -i.tmp 's/href="recenzie\.html"/href="\/recenzie"/g' "$file"
            sed -i.tmp 's/href="about\.html"/href="\/about"/g' "$file"
            sed -i.tmp 's/href="kontakt\.html"/href="\/kontakt"/g' "$file"
        else
            # Slovak navigation links
            sed -i.tmp 's/href="sk-menu\.html"/href="\/sk-menu"/g' "$file"
            sed -i.tmp 's/href="sk-akcie\.html"/href="\/sk-akcie"/g' "$file"
            sed -i.tmp 's/href="sk-rezervace\.html"/href="\/sk-rezervace"/g' "$file"
            sed -i.tmp 's/href="sk-galeria\.html"/href="\/sk-galeria"/g' "$file"
            sed -i.tmp 's/href="sk-recenzie\.html"/href="\/sk-recenzie"/g' "$file"
            sed -i.tmp 's/href="sk-about\.html"/href="\/sk-about"/g' "$file"
            sed -i.tmp 's/href="sk-kontakt\.html"/href="\/sk-kontakt"/g' "$file"
        fi
        
        # Update language switcher links in ALL files
        sed -i.tmp 's/href="index\.html"/href="\/"/g' "$file"
        sed -i.tmp 's/href="sk-index\.html"/href="\/sk-index"/g' "$file"
        
        # Update footer links - Czech
        sed -i.tmp 's/href="menu\.html"/href="\/menu"/g' "$file"
        sed -i.tmp 's/href="akcie\.html"/href="\/akcie"/g' "$file"
        sed -i.tmp 's/href="rezervace\.html"/href="\/rezervace"/g' "$file"
        sed -i.tmp 's/href="galeria\.html"/href="\/galeria"/g' "$file"
        sed -i.tmp 's/href="recenzie\.html"/href="\/recenzie"/g' "$file"
        sed -i.tmp 's/href="about\.html"/href="\/about"/g' "$file"
        sed -i.tmp 's/href="kontakt\.html"/href="\/kontakt"/g' "$file"
        
        # Update footer links - Slovak
        sed -i.tmp 's/href="sk-menu\.html"/href="\/sk-menu"/g' "$file"
        sed -i.tmp 's/href="sk-akcie\.html"/href="\/sk-akcie"/g' "$file"
        sed -i.tmp 's/href="sk-rezervace\.html"/href="\/sk-rezervace"/g' "$file"
        sed -i.tmp 's/href="sk-galeria\.html"/href="\/sk-galeria"/g' "$file"
        sed -i.tmp 's/href="sk-recenzie\.html"/href="\/sk-recenzie"/g' "$file"
        sed -i.tmp 's/href="sk-about\.html"/href="\/sk-about"/g' "$file"
        sed -i.tmp 's/href="sk-kontakt\.html"/href="\/sk-kontakt"/g' "$file"
        
        # Clean up temporary files
        rm "$file.tmp" 2>/dev/null || true
        
        echo "Updated $file"
    else
        echo "File $file not found, skipping..."
    fi
done

echo ""
echo "✅ Done! All internal links updated to remove .html extensions."
echo ""
echo "📋 Next steps:"
echo "1. .htaccess file is already configured"
echo "2. Test all links locally"
echo "3. Upload to web server"
echo "4. Test all links on production"
echo ""
echo "🔗 URLs will now work like:"
echo "   - https://yourdomain.com/ (instead of index.html)"
echo "   - https://yourdomain.com/menu (instead of menu.html)"
echo "   - https://yourdomain.com/sk-menu (instead of sk-menu.html)"
echo ""