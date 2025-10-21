/*
  Simple generator: scans assets/images/gallery and assets/images/home
  and injects <img> tags into galeria.html (between <!-- GALLERY:START --> markers)
  and index.html (between <!-- HOMEGALLERY:START --> markers).

  Usage: node scripts/generate_galleries.js
*/
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const galleryDir = path.join(root, 'assets', 'images', 'gallery');
const homeDir = path.join(root, 'assets', 'images', 'home');

const galHtml = path.join(root, 'galeria.html');
const indexHtml = path.join(root, 'index.html');

function makeImgs(dir, webPrefix){
  if(!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f=>/[.](jpe?g|png|gif|webp)$/i.test(f))
    .map(f=>`${webPrefix}/${f}`);
}

function inject(filePath, startMarker, endMarker, itemsHtml){
  let content = fs.readFileSync(filePath,'utf8');
  const start = content.indexOf(startMarker);
  const end = content.indexOf(endMarker, start);
  if(start===-1 || end===-1){
    console.error('Markers not found in', filePath);
    return;
  }
  const before = content.slice(0, start+startMarker.length);
  const after = content.slice(end);
  const newContent = before + '\n' + itemsHtml.join('\n') + '\n' + after;
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Updated', filePath);
}

// Build html arrays
const galleryImgs = makeImgs(galleryDir, '/assets/images/gallery');
const homeImgs = makeImgs(homeDir, '/assets/images/home');

const galleryHtml = galleryImgs.map((src,i)=>`          <img src="${src}" alt="Galerie ${i+1}">`);
const homeHtml = homeImgs.map((src,i)=>`            <img src="${src}" alt="Momentka ${i+1}">`);

// Inject into files
inject(galHtml, '<!-- GALLERY:START -->', '<!-- GALLERY:END -->', galleryHtml.length?galleryHtml:['          <!-- no images found -->']);
inject(indexHtml, '<!-- HOMEGALLERY:START -->', '<!-- HOMEGALLERY:END -->', homeHtml.length?homeHtml:['            <!-- no images found -->']);

console.log('Done');
