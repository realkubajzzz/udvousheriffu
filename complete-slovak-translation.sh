#!/bin/bash

echo "🇸🇰 Starting comprehensive Slovak translation..."

# Helper function to translate Czech to Slovak in files
translate_file() {
    local file="$1"
    echo "Translating: $file"
    
    # Common Czech to Slovak translations
    sed -i '' 's/Otevřít menu/Otvoriť menu/g' "$file"
    sed -i '' 's/Načítavam akce/Načítavam akcie/g' "$file" 
    sed -i '' 's/Aktuální akce/Aktuálne akcie/g' "$file"
    sed -i '' 's/Více o/Viac o/g' "$file"
    sed -i '' 's/všechny recenze/všetky recenzie/g' "$file"
    sed -i '' 's/Zobrazit/Zobraziť/g' "$file"
    sed -i '' 's/Všechna práva vyhrazena/Všetky práva vyhradené/g' "$file"
    sed -i '' 's/Prohlédněte si/Prezrite si/g' "$file"
    sed -i '' 's/pokud chcete/ak si chcete/g' "$file" 
    sed -i '' 's/využijte/využite/g' "$file"
    sed -i '' 's/rezervační kanál/rezervačný kanál/g' "$file"
    sed -i '' 's/stůl/stôl/g' "$file"
    sed -i '' 's/Upozornění/Upozornenie/g' "$file"
    sed -i '' 's/mohou obsahovat/môžu obsahovať/g' "$file"
    sed -i '' 's/alergeny/alergény/g' "$file"
    sed -i '' 's/vejce/vajcia/g' "$file"
    sed -i '' 's/mléko/mlieko/g' "$file"
    sed -i '' 's/ořechy/orechy/g' "$file"
    sed -i '' 's/máte/máte/g' "$file"
    sed -i '' 's/informujte prosím/informujte prosím/g' "$file"
    sed -i '' 's/obsluhu/obsluhu/g' "$file"
    sed -i '' 's/k dispozici/k dispozícii/g' "$file"
    sed -i '' 's/na vyžádání/na vyžiadanie/g' "$file"
}

# Translate all Slovak files
for file in /Users/jakub/Desktop/Web\ u\ 2\ sheriff/sk-*.html; do
    if [[ -f "$file" && ! "$file" =~ (test|debug|cms) ]]; then
        translate_file "$file"
    fi
done

echo "✅ Slovak translation completed!"
