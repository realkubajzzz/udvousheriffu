// Simple nav toggle for mobile
document.addEventListener('DOMContentLoaded', ()=>{
  const toggles = document.querySelectorAll('.nav-toggle');
  toggles.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const nav = document.querySelector('.nav');
      if(!nav) return;
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  });

  // Reveal on scroll
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('visible');
    });
  },{threshold:0.08});
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
});

// Open/closed status updater
function parseHHMM(str){
  const m = str.match(/^(\d{1,2}):(\d{2})$/);
  if(!m) return null;
  return {h: parseInt(m[1],10), m: parseInt(m[2],10)};
}

function minutesSinceMidnight(d){ return d.getHours()*60 + d.getMinutes(); }

function setSiteStatus(el){
  if(!el) return;
  // manual override
  const forced = el.getAttribute('data-force');
  if(forced === 'open'){ el.classList.add('open'); el.classList.remove('closed'); el.querySelector('.status-text').textContent = 'Máme otevřeno'; return; }
  if(forced === 'closed'){ el.classList.add('closed'); el.classList.remove('open'); el.querySelector('.status-text').textContent = 'Máme zavřeno'; return; }

  const defOpen = el.getAttribute('data-default-open') || '11:00';
  const defClose = el.getAttribute('data-default-close') || '23:00';
  const o = parseHHMM(defOpen); const c = parseHHMM(defClose);
  if(!o || !c) return;
  const now = new Date();
  const mins = minutesSinceMidnight(now);
  const openM = o.h*60 + o.m; const closeM = c.h*60 + c.m;
  let open = false;
  if(openM <= closeM){ open = mins >= openM && mins < closeM; }
  else { // overnight schedule
    open = mins >= openM || mins < closeM;
  }
  if(open){ el.classList.add('open'); el.classList.remove('closed'); el.querySelector('.status-text').textContent = 'Máme otevřeno'; }
  else { el.classList.add('closed'); el.classList.remove('open'); el.querySelector('.status-text').textContent = 'Máme zavřeno'; }
}

// Initialize status on DOMContentLoaded (wait a tick in case header was injected)
document.addEventListener('DOMContentLoaded', ()=>{
  // If no #siteStatus exists in the document (we removed inline badges), create a floating one
  let el = document.getElementById('siteStatus');
  if(!el){
    const wrap = document.createElement('div'); wrap.className = 'floating-status';
    el = document.createElement('div'); el.id = 'siteStatus'; el.className = 'open-status'; el.setAttribute('aria-live','polite');
    el.setAttribute('data-default-open','11:00'); el.setAttribute('data-default-close','23:00');
    const dot = document.createElement('span'); dot.className = 'dot'; dot.setAttribute('aria-hidden','true');
    const txt = document.createElement('span'); txt.className = 'status-text'; txt.textContent = 'Načítavam…';
    el.appendChild(dot); el.appendChild(txt); wrap.appendChild(el); document.body.appendChild(wrap);
  }
  setSiteStatus(el);
  // If Supabase config is provided, wire realtime updates so site status updates live
  try { initSupabaseStatusRealtime && initSupabaseStatusRealtime(el); } catch(e){ console.warn('Supabase realtime init failed', e); }
  // re-evaluate every 30 seconds
  setInterval(()=> setSiteStatus(el), 30000);
  
  // Initialize Supabase gallery loading for gallery page
  try { initSupabaseGallery && initSupabaseGallery(); } catch(e){ console.warn('Supabase gallery init failed', e); }
  
  // Initialize Supabase carousel loading for homepage
  try { initSupabaseHomeCarousel && initSupabaseHomeCarousel(); } catch(e){ console.warn('Supabase home carousel init failed', e); }
  
  // Initialize Supabase menu loading for menu page
  try { initSupabaseMenu && initSupabaseMenu(); } catch(e){ console.warn('Supabase menu init failed', e); }
});

// Fallback: if no Supabase configured, use local SSE endpoint at /server/status_sse.php
document.addEventListener('DOMContentLoaded', ()=>{
  const el = document.getElementById('siteStatus');
  if(!el) return;
  const cfg = window.SHERIFF_SUPABASE || {};
  if(cfg.url && cfg.key) return; // supabase is configured, no fallback

  // try to connect to local SSE
  try{
    const sse = new EventSource('/server/status_sse.php');
    sse.addEventListener('status', (e)=>{
      try{
        const data = JSON.parse(e.data);
        if(data && typeof data.is_open !== 'undefined'){
          el.setAttribute('data-force', data.is_open ? 'open' : 'closed');
          setSiteStatus(el);
        }
      }catch(err){ console.warn('Invalid status payload', err); }
    });
    sse.addEventListener('heartbeat', ()=>{});
    sse.addEventListener('error', ()=>{ sse.close(); });
    window.__sheriff_sse = sse;
  }catch(e){
    console.warn('SSE fallback not available', e);
  }
});

// Supabase realtime wiring: optional. To enable, add a small config before this script runs:
// <script>window.SHERIFF_SUPABASE = { url: 'https://xyz.supabase.co', key: 'public-anon-key' }</script>
// and include the supabase-js client (CDN) or expose a createClient function as window.createClient.
async function initSupabaseStatusRealtime(el){
  if(!el) return;
  const cfg = window.SHERIFF_SUPABASE || {};
  if(!cfg.url || !cfg.key) return;

  const createClient = window.createClient || (window.supabase && window.supabase.createClient) || (window.Supabase && window.Supabase.createClient);
  if(!createClient){
    console.warn('Supabase client not found. Include @supabase/supabase-js (UMD) or expose window.createClient. Live updates disabled.');
    return;
  }

  const client = createClient(cfg.url, cfg.key);
  // expose client for debugging
  window.__sheriff_supabase_client = client;
  console.info('[sheriff] Supabase client created', cfg.url);

  // connection UI removed (no visible Supabase status text)

  // Fetch initial row safely
  try{
    let res;
    // Some UMD builds expose maybeSingle, some do not -> attempt maybeSingle then fallback to single
    try{
      res = await client.from('site_status').select('*').eq('id',1).maybeSingle();
    }catch(e){
      // fallback
      try{ res = await client.from('site_status').select('*').eq('id',1).single(); }catch(e2){ res = { data: null, error: e2 }; }
    }
    const data = res && (res.data !== undefined ? res.data : null);
    if(data && typeof data.is_open !== 'undefined'){
      el.setAttribute('data-force', data.is_open ? 'open' : 'closed');
      setSiteStatus(el);
      window.__sheriff_supabase_connected = true;
      const conn = document.getElementById('sheriffSupabaseStatus'); if(conn) conn.textContent = 'Supabase: connected';
    } else {
      const conn = document.getElementById('sheriffSupabaseStatus'); if(conn) conn.textContent = 'Supabase: no row';
    }
  }catch(err){
    console.warn('Supabase initial fetch failed', err);
    const conn = document.getElementById('sheriffSupabaseStatus'); if(conn) conn.textContent = 'Supabase: error';
  }

  // Subscribe to updates (support v2 channel API and older from(...).on())
  try{
    let subscribed = false;
    if(typeof client.channel === 'function'){
      const chan = client.channel('site_status_channel')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'site_status', filter: 'id=eq.1' }, (payload) => {
          const newRow = payload.new || payload.record || payload;
          if(newRow && typeof newRow.is_open !== 'undefined'){
            el.setAttribute('data-force', newRow.is_open ? 'open' : 'closed');
            setSiteStatus(el);
            const conn = document.getElementById('sheriffSupabaseStatus'); if(conn) conn.textContent = 'Supabase: live';
          }
        })
        .subscribe();
      window.__sheriff_supabase_channel = chan;
      subscribed = true;
    } else if(typeof client.from === 'function'){
      // older subscription style
      try{
        client.from('site_status:id=eq.1').on('UPDATE', payload => {
          const newRow = payload.new || payload.record || payload;
          if(newRow && typeof newRow.is_open !== 'undefined'){
            el.setAttribute('data-force', newRow.is_open ? 'open' : 'closed');
            setSiteStatus(el);
            const conn = document.getElementById('sheriffSupabaseStatus'); if(conn) conn.textContent = 'Supabase: live';
          }
        }).subscribe();
        subscribed = true;
      }catch(e){ console.warn('Supabase old subscription failed', e); }
    }

    // If subscription didn't start, fallback to polling every 8s
    if(!subscribed){
      console.info('[sheriff] Supabase realtime not available, falling back to polling');
      const poll = async ()=>{
        try{
          const r = await client.from('site_status').select('*').eq('id',1).maybeSingle ? await client.from('site_status').select('*').eq('id',1).maybeSingle() : await client.from('site_status').select('*').eq('id',1).single();
          const d = r && (r.data !== undefined ? r.data : null);
          if(d && typeof d.is_open !== 'undefined'){
            el.setAttribute('data-force', d.is_open ? 'open' : 'closed'); setSiteStatus(el);
            const conn = document.getElementById('sheriffSupabaseStatus'); if(conn) conn.textContent = 'Supabase: poll';
          }
        }catch(e){ console.warn('Supabase poll failed', e); }
      };
      // run immediately then every 8s
      poll();
      window.__sheriff_supabase_poll = setInterval(poll, 8000);
    }
  }catch(e){ console.warn('Supabase subscription init failed', e); }
}

// Load gallery images from Supabase
async function initSupabaseGallery(){
  const galleryContainer = document.querySelector('.gallery');
  if(!galleryContainer) return; // not on gallery page
  
  // Only load from Supabase if we're on the actual gallery page (has loading-gallery element)
  if(!document.querySelector('.loading-gallery')) return;
  
  const cfg = window.SHERIFF_SUPABASE || {};
  if(!cfg.url || !cfg.key) {
    console.warn('Supabase not configured, gallery will remain empty');
    return;
  }

  const createClient = window.createClient || (window.supabase && window.supabase.createClient) || (window.Supabase && window.Supabase.createClient);
  if(!createClient){
    console.warn('Supabase client not found. Gallery will remain empty.');
    return;
  }

  const client = createClient(cfg.url, cfg.key);
  
  try{
    // Fetch all gallery images ordered by created_at desc
    const { data, error } = await client
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });
    
    if(error) throw error;
    
    // Clear existing gallery content
    galleryContainer.innerHTML = '';
    
    if(!data || data.length === 0){
      galleryContainer.innerHTML = '<p class="no-images">Zatím žádné fotky v galerii.</p>';
      return;
    }
    
    // Create gallery images
    data.forEach((row, index) => {
      const img = document.createElement('img');
      img.src = row.url;
      img.alt = row.caption || `Galerie obrázek ${index + 1}`;
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => {
        if(window.sheriffOpenLightbox) {
          window.sheriffOpenLightbox(row.url, row.caption || img.alt);
        }
      });
      galleryContainer.appendChild(img);
    });
    
    console.info(`[sheriff] Loaded ${data.length} images from Supabase gallery`);
    
    // Subscribe to new gallery inserts for realtime updates
    if(typeof client.channel === 'function'){
      const chan = client.channel('gallery_channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gallery' }, (payload) => {
          const newRow = payload.new;
          if(newRow && newRow.url){
            // Prepend new image to gallery
            const img = document.createElement('img');
            img.src = newRow.url;
            img.alt = newRow.caption || 'Nový obrázek';
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
              if(window.sheriffOpenLightbox) {
                window.sheriffOpenLightbox(newRow.url, newRow.caption || img.alt);
              }
            });
            galleryContainer.insertBefore(img, galleryContainer.firstChild);
            console.info('[sheriff] New gallery image added via realtime');
          }
        })
        .subscribe();
    }
    
  } catch(err) {
    console.error('Failed to load Supabase gallery:', err);
    galleryContainer.innerHTML = '<p class="gallery-error">Chyba při načítání galerie.</p>';
  }
}

// Load homepage carousel images from Supabase (max 15 images)
async function initSupabaseHomeCarousel(){
  const carouselTrack = document.getElementById('carTrack');
  if(!carouselTrack) return; // not on homepage with carousel
  
  const cfg = window.SHERIFF_SUPABASE || {};
  if(!cfg.url || !cfg.key) {
    console.warn('Supabase not configured, carousel will use local images');
    return;
  }

  const createClient = window.createClient || (window.supabase && window.supabase.createClient) || (window.Supabase && window.Supabase.createClient);
  if(!createClient){
    console.warn('Supabase client not found. Carousel will use local images.');
    return;
  }

  const client = createClient(cfg.url, cfg.key);
  
  try{
    // Fetch up to 15 gallery images ordered by created_at desc
    const { data, error } = await client
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);
    
    if(error) throw error;
    
    if(!data || data.length === 0){
      console.warn('No Supabase images found, carousel will use local images');
      return;
    }
    
    // Clear existing carousel content and reset cloned flag
    carouselTrack.innerHTML = '';
    carouselTrack.dataset.cloned = 'false';
    
    // Create carousel images from Supabase
    data.forEach((row, index) => {
      const img = document.createElement('img');
      img.src = row.url;
      img.alt = row.caption || `Momentka ${index + 1}`;
      carouselTrack.appendChild(img);
    });
    
    console.info(`[sheriff] Loaded ${data.length} images from Supabase for homepage carousel`);
    
    // Re-initialize carousel cloning and autoplay since we changed the content
    if(window.reinitializeCarousel) {
      window.reinitializeCarousel();
    }
    
  } catch(err) {
    console.warn('Failed to load Supabase carousel images:', err);
    // Keep existing local images as fallback
  }
}

function handleContactSubmit(e){
  e.preventDefault();
  const form = e.target;
  const data = new FormData(form);
  const obj = Object.fromEntries(data.entries());
  // Since there is no backend, show a friendly message
  alert('Děkujeme, ' + (obj.name||'') + '! Vaše zpráva byla přijata lokálně (statický demo).');
  form.reset();
}

// Lightbox initializer (safe: will not duplicate handlers)
document.addEventListener('DOMContentLoaded', ()=>{
  // Initialize lightbox if there's a gallery OR a carousel on the page
  if(document.querySelectorAll('.gallery').length===0 && document.querySelectorAll('.car-track img').length===0) return;
  // Avoid double-init
  if(window.__sheriff_lightbox_initialized) return;
  window.__sheriff_lightbox_initialized = true;

  // Expose a helper to open the lightbox from anywhere (delegation-friendly)
  window.sheriffOpenLightbox = function(src, alt){
    let lightbox = document.getElementById('lightbox');
    let lbImg = document.getElementById('lightboxImg');
    let close = document.getElementById('lightboxClose');
    if(!lightbox){
      lightbox = document.createElement('div'); lightbox.id='lightbox'; lightbox.className='lightbox-overlay'; lightbox.setAttribute('aria-hidden','true');
      close = document.createElement('button'); close.id='lightboxClose'; close.className='lightbox-close'; close.textContent='\u2715';
      lbImg = document.createElement('img'); lbImg.id='lightboxImg'; lbImg.className='lightbox-img';
      lightbox.appendChild(close); lightbox.appendChild(lbImg); document.body.appendChild(lightbox);

      // Close handlers
      close.addEventListener('click', ()=>{ lightbox.classList.remove('visible'); lightbox.setAttribute('aria-hidden','true'); lbImg.src=''; });
      lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) { lightbox.classList.remove('visible'); lightbox.setAttribute('aria-hidden','true'); lbImg.src=''; } });
      document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') { lightbox.classList.remove('visible'); lightbox.setAttribute('aria-hidden','true'); lbImg.src=''; } });
    }
    lbImg.src = src; lbImg.alt = alt||''; lightbox.classList.add('visible'); lightbox.setAttribute('aria-hidden','false');
    if(close) close.focus();
  };

  // Attach click handlers for any existing gallery images (non-delegated)
  document.querySelectorAll('.gallery img').forEach(img=>{ img.style.cursor='pointer'; img.addEventListener('click', ()=> window.sheriffOpenLightbox(img.src, img.alt)); });
  // If the page already contains a lightbox markup (static HTML), ensure its controls close it
  (function attachExistingLightboxHandlers(){
    const lightbox = document.getElementById('lightbox');
    if(!lightbox) return;
    const lbImg = document.getElementById('lightboxImg');
    const close = document.getElementById('lightboxClose');
    // Close function
    const closeLB = ()=>{ if(lightbox){ lightbox.classList.remove('visible'); lightbox.setAttribute('aria-hidden','true'); if(lbImg) lbImg.src=''; } };
    if(close && !close.__sheriff_attached){ close.addEventListener('click', closeLB); close.__sheriff_attached = true; }
    if(!lightbox.__sheriff_overlay_attached){ lightbox.addEventListener('click', (e)=>{ if(e.target===lightbox) closeLB(); }); lightbox.__sheriff_overlay_attached = true; }
    if(!document.__sheriff_escape_attached){ document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeLB(); }); document.__sheriff_escape_attached = true; }
  })();
});

// Homepage carousel controls
document.addEventListener('DOMContentLoaded', ()=>{
  const track = document.getElementById('carTrack');
  const prev = document.getElementById('carPrev');
  const next = document.getElementById('carNext');
  if(!track || !prev || !next) return;

  const step = 240; // px per click (image width + gap)
  prev.addEventListener('click', ()=>{ track.scrollBy({left: -step, behavior: 'smooth'}); });
  next.addEventListener('click', ()=>{ track.scrollBy({left: step, behavior: 'smooth'}); });

  // Keyboard support when carousel is focused
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowLeft') prev.click();
    if(e.key === 'ArrowRight') next.click();
  });
});

// Infinite autoplay carousel with pause-on-hover and lightbox integration
document.addEventListener('DOMContentLoaded', ()=>{
  const track = document.getElementById('carTrack');
  if(!track) return;

  let rafId = null;
  let paused = false;
  let originalCount = 0;
  let originalWidth = 0;
  const pixelsPerSecond = 100;

  // make all carousel images clickable for lightbox (works with ensureLightbox)
  function attachCarouselToLightbox(){
    const imgs = Array.from(track.querySelectorAll('img'));
    imgs.forEach(img=> img.classList.add('sheriff-carousel-img'));
  }

  function getOriginalWidth(){
    let w = 0;
    for(let i=0;i<originalCount;i++){
      const el = track.children[i];
      if(el) w += el.getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap||12);
    }
    return w;
  }

  function initializeCarousel(){
    // Stop any running animation
    if(rafId) { cancelAnimationFrame(rafId); rafId = null; }
    
    attachCarouselToLightbox();

    // Duplicate content to allow seamless scroll
    const children = Array.from(track.children);
    if(children.length === 0) return;
    
    // Reset cloning if already cloned
    if(track.dataset.cloned === 'true'){
      // Remove cloned children (second half)
      while(track.children.length > children.length / 2){
        track.removeChild(track.lastChild);
      }
      track.dataset.cloned = 'false';
    }
    
    // Clone children for infinite scroll
    const originalChildren = Array.from(track.children);
    originalCount = originalChildren.length;
    originalChildren.forEach(node=> track.appendChild(node.cloneNode(true)));
    track.dataset.cloned = 'true';

    originalWidth = getOriginalWidth();
    window.addEventListener('resize', ()=>{ originalWidth = getOriginalWidth(); });

    let lastTime = null;
    function step(t){
      if(paused){ lastTime = t; rafId = requestAnimationFrame(step); return; }
      if(!lastTime) lastTime = t;
      // clamp dt to avoid jumps when tab was backgrounded
      let dt = (t - lastTime)/1000;
      if(dt > 0.25) dt = 0.25;
      lastTime = t;
      const delta = pixelsPerSecond * dt;
      // apply a tiny easing to smooth perceived motion (not required but helps)
      track.scrollLeft += delta;
      if(track.scrollLeft >= originalWidth){
        track.scrollLeft -= originalWidth; // loop
      }
      rafId = requestAnimationFrame(step);
    }

    function startAuto(){ if(!rafId){ lastTime = null; rafId = requestAnimationFrame(step); } }
    function stopAuto(){ if(rafId){ cancelAnimationFrame(rafId); rafId = null; lastTime = null; } }

    // Pause on hover and focusable children
    track.addEventListener('mouseenter', ()=>{ paused = true; });
    track.addEventListener('mouseleave', ()=>{ paused = false; });
    track.addEventListener('focusin', ()=>{ paused = true; });
    track.addEventListener('focusout', ()=>{ paused = false; });

    // Manual controls should pause auto for a short time
    const prev = document.getElementById('carPrev');
    const next = document.getElementById('carNext');
    let manualPauseTimer = null;
    function manualPause(){ paused = true; clearTimeout(manualPauseTimer); manualPauseTimer = setTimeout(()=>{ paused = false; }, 1200); }
    if(prev) prev.addEventListener('click', manualPause);
    if(next) next.addEventListener('click', manualPause);

    // Also allow dragging/scroll interactions to pause
    let isDown = false; let startX=0; let scrollStart=0;
    track.addEventListener('mousedown', (e)=>{ isDown=true; startX=e.pageX; scrollStart=track.scrollLeft; paused=true; });
    window.addEventListener('mouseup', ()=>{ if(isDown){ isDown=false; manualPause(); }});
    track.addEventListener('mousemove', (e)=>{ if(!isDown) return; const dx = e.pageX - startX; track.scrollLeft = scrollStart - dx; });

    // Use event delegation on the track so cloned images (and future images) trigger lightbox
    track.addEventListener('click', (e)=>{
      const img = e.target.closest('img');
      if(!img) return;
      // Use the exposed helper
      if(window.sheriffOpenLightbox) window.sheriffOpenLightbox(img.src, img.alt);
    });

    // start autoplay
    startAuto();
  }

  // Expose reinitialize function for Supabase carousel loading
  window.reinitializeCarousel = initializeCarousel;

  // Initialize carousel with existing content (local images)
  initializeCarousel();
});

// Load menu images from Supabase
async function initSupabaseMenu(){
  const menuContainer = document.querySelector('#menuGallery .gallery');
  if(!menuContainer) return; // not on menu page
  
  // Only load from Supabase if we're on the menu page (has menuGallery section)
  if(!document.querySelector('#menuGallery')) return;
  
  const cfg = window.SHERIFF_SUPABASE || {};
  if(!cfg.url || !cfg.key) {
    console.warn('Supabase not configured, menu will remain with local images');
    return;
  }

  const createClient = window.createClient || (window.supabase && window.supabase.createClient) || (window.Supabase && window.Supabase.createClient);
  if(!createClient){
    console.warn('Supabase client not found. Menu will remain with local images.');
    return;
  }

  const client = createClient(cfg.url, cfg.key);
  
  try{
    // Fetch all menu images ordered by created_at desc
    const { data, error } = await client
      .from('menu_images')
      .select('*')
      .order('created_at', { ascending: false });
    
    if(error) throw error;
    
    // Clear existing menu content
    menuContainer.innerHTML = '';
    
    if(!data || data.length === 0){
      menuContainer.innerHTML = '<p class="no-images">Zatím žádné fotky v menu.</p>';
      return;
    }
    
    // Create simple menu images
    data.forEach((row, index) => {
      const img = document.createElement('img');
      // Use direct URL from database
      img.src = row.image_url;
      img.alt = row.caption || `Menu obrázek ${index + 1}`;
      img.style.cursor = 'pointer';
      
      // Click handler for lightbox
      img.addEventListener('click', () => {
        if(window.sheriffOpenLightbox) {
          window.sheriffOpenLightbox(img.src, row.caption || img.alt);
        }
      });
      
      menuContainer.appendChild(img);
    });
    
    console.info(`[sheriff] Loaded ${data.length} menu images from Supabase`);
    
    // Subscribe to menu_images table changes for realtime updates
    if(typeof client.channel === 'function'){
      const chan = client.channel('menu_images_channel')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'menu_images' }, () => {
          // Reload menu on any change to maintain proper sorting
          initSupabaseMenu();
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'menu_images' }, () => {
          // Reload menu on delete
          initSupabaseMenu();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'menu_images' }, () => {
          // Reload menu on update
          initSupabaseMenu();
        })
        .subscribe();
    }
    
  } catch(err) {
    console.error('Failed to load Supabase menu:', err);
    menuContainer.innerHTML = '<p class="menu-error">Chyba při načítání menu.</p>';
  }
}
