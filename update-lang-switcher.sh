#!/bin/bash

# Update Czech files
for file in akcie.html rezervace.html galeria.html about.html kontakt.html recenzie.html; do
  echo "Updating $file..."
  
  # Get the current page name for active state
  page_name=$(echo "$file" | sed 's/.html//')
  
  if [ "$file" = "akcie.html" ]; then
    sed -i '' '/<a href="kontakt.html">Kontakt<\/a>/a\
          <div class="language-switcher">\
            <a href="akcie.html" class="lang-btn active">\
              <span class="lang-flag">🇨🇿</span>\
              <span>CZ</span>\
            </a>\
            <a href="sk-akcie.html" class="lang-btn">\
              <span class="lang-flag">🇸🇰</span>\
              <span>SK</span>\
            </a>\
          </div>' "$file"
  elif [ "$file" = "rezervace.html" ]; then
    sed -i '' '/<a href="kontakt.html">Kontakt<\/a>/a\
          <div class="language-switcher">\
            <a href="rezervace.html" class="lang-btn active">\
              <span class="lang-flag">🇨🇿</span>\
              <span>CZ</span>\
            </a>\
            <a href="sk-rezervace.html" class="lang-btn">\
              <span class="lang-flag">🇸🇰</span>\
              <span>SK</span>\
            </a>\
          </div>' "$file"
  elif [ "$file" = "galeria.html" ]; then
    sed -i '' '/<a href="kontakt.html">Kontakt<\/a>/a\
          <div class="language-switcher">\
            <a href="galeria.html" class="lang-btn active">\
              <span class="lang-flag">🇨🇿</span>\
              <span>CZ</span>\
            </a>\
            <a href="sk-galeria.html" class="lang-btn">\
              <span class="lang-flag">🇸🇰</span>\
              <span>SK</span>\
            </a>\
          </div>' "$file"
  elif [ "$file" = "about.html" ]; then
    sed -i '' '/<a href="kontakt.html">Kontakt<\/a>/a\
          <div class="language-switcher">\
            <a href="about.html" class="lang-btn active">\
              <span class="lang-flag">🇨🇿</span>\
              <span>CZ</span>\
            </a>\
            <a href="sk-about.html" class="lang-btn">\
              <span class="lang-flag">🇸🇰</span>\
              <span>SK</span>\
            </a>\
          </div>' "$file"
  elif [ "$file" = "kontakt.html" ]; then
    sed -i '' '/<a href="kontakt.html" class="active">Kontakt<\/a>/a\
          <div class="language-switcher">\
            <a href="kontakt.html" class="lang-btn active">\
              <span class="lang-flag">🇨🇿</span>\
              <span>CZ</span>\
            </a>\
            <a href="sk-kontakt.html" class="lang-btn">\
              <span class="lang-flag">🇸🇰</span>\
              <span>SK</span>\
            </a>\
          </div>' "$file"
  elif [ "$file" = "recenzie.html" ]; then
    sed -i '' '/<a href="kontakt.html">Kontakt<\/a>/a\
          <div class="language-switcher">\
            <a href="recenzie.html" class="lang-btn active">\
              <span class="lang-flag">🇨🇿</span>\
              <span>CZ</span>\
            </a>\
            <a href="sk-recenzie.html" class="lang-btn">\
              <span class="lang-flag">🇸🇰</span>\
              <span>SK</span>\
            </a>\
          </div>' "$file"
  fi
done

echo "Czech files updated!"