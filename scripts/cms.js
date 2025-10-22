// CMS JavaScript s autentifikáciou
let cmsSupabase = null;
let currentUser = null;

// Inicializácia
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
    checkSession();
    setupEventListeners();
});

function initSupabase() {
    const cfg = window.SHERIFF_SUPABASE || {};
    if (!cfg.url || !cfg.key) {
        showError('Supabase nie je nakonfigurované');
        return;
    }

    const createClient = window.createClient || (window.supabase && window.supabase.createClient);
    if (!createClient) {
        showError('Supabase klient nie je dostupný');
        return;
    }

    cmsSupabase = createClient(cfg.url, cfg.key);
    console.log('[CMS] Supabase inicializované');
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Logout button  
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

// Session management
function checkSession() {
    const session = localStorage.getItem('sheriff_cms_session');
    if (session) {
        try {
            const userData = JSON.parse(session);
            if (userData.expires > Date.now()) {
                loginSuccess(userData);
                return;
            }
        } catch (e) {
            console.warn('[CMS] Neplatná session');
        }
    }
    showLoginScreen();
}

function saveSession(userData) {
    const sessionData = {
        ...userData,
        expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hodín
    };
    localStorage.setItem('sheriff_cms_session', JSON.stringify(sessionData));
}

function clearSession() {
    localStorage.removeItem('sheriff_cms_session');
}

// Login handling
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showLoginError('Vyplňte všetky polia');
        return;
    }

    showLoginError('Prihlasovanie...', false);

    try {
        // Volanie našej custom funkcie cez RPC
        const { data, error } = await cmsSupabase.rpc('cms_verify_login', {
            p_username: username,
            p_password: password
        });

        if (error) throw error;

        if (data && data.length > 0) {
            const user = data[0];
            loginSuccess({
                user_id: user.user_id,
                username: user.username, 
                full_name: user.full_name,
                last_login: user.last_login
            });
        } else {
            showLoginError('Nesprávne užívateľské meno alebo heslo');
        }
    } catch (error) {
        console.error('[CMS] Login error:', error);
        showLoginError('Chyba pri prihlasovaní: ' + error.message);
    }
}

function loginSuccess(userData) {
    currentUser = userData;
    saveSession(userData);
    
    // Skry login screen, ukáž CMS
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('cmsApp').style.display = 'block';
    document.getElementById('cmsFooter').style.display = 'block';
    
    // Aktualizuj user info
    document.getElementById('currentUser').textContent = 
        `Prihlásený: ${userData.full_name || userData.username}`;
    
    // Načítaj CMS data
    loadCMSData();
    
    console.log('[CMS] Prihlásenie úspešné:', userData);
}

function handleLogout() {
    currentUser = null;
    clearSession();
    showLoginScreen();
}

function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('cmsApp').style.display = 'none';  
    document.getElementById('cmsFooter').style.display = 'none';
    
    // Vyčisti form
    document.getElementById('loginForm').reset();
    hideLoginError();
}

function showLoginError(message, isError = true) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.style.backgroundColor = isError ? '#fee' : '#e7f3ff';
    errorDiv.style.color = isError ? '#c33' : '#0066cc';
    errorDiv.style.borderColor = isError ? '#fcc' : '#b8d4f0';
}

function hideLoginError() {
    document.getElementById('loginError').style.display = 'none';
}

// CMS Functions (len ak je užívateľ prihlásený)
async function loadCMSData() {
    if (!currentUser || !cmsSupabase) return;
    
    try {
        await Promise.all([
            loadGalleryImages(),
            loadMenuImages(), 
            loadCurrentStatus()
        ]);
    } catch (error) {
        console.error('[CMS] Chyba pri načítavaní dát:', error);
        showError('Chyba pri načítavaní dát');
    }
}

async function loadGalleryImages() {
    try {
        const { data, error } = await cmsSupabase
            .from('gallery')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const container = document.getElementById('galleryItems');
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p>Žiadne obrázky v galérii.</p>';
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="cms-item">
                <img src="${item.url}" alt="${item.caption || 'Obrázok'}" />
                <div class="cms-item-info">
                    <h4>${item.caption || 'Bez názvu'}</h4>
                    <p>Pridané: ${new Date(item.created_at).toLocaleDateString('sk-SK')}</p>
                </div>
                <button class="cms-delete" onclick="deleteGalleryImage('${item.id}')">
                    Zmazať
                </button>
            </div>
        `).join('');

        console.log('[CMS] Načítané galéria obrázky:', data.length);
    } catch (error) {
        console.error('[CMS] Chyba pri načítavaní galérie:', error);
        showStatus('galleryStatus', 'Chyba pri načítavaní galérie: ' + error.message, 'error');
    }
}

async function loadMenuImages() {
    try {
        const { data, error } = await cmsSupabase
            .from('menu_images')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const container = document.getElementById('menuItems');
        if (!container) return;

        if (!data || data.length === 0) {
            container.innerHTML = '<p>Žiadne menu obrázky.</p>';
            return;
        }

        container.innerHTML = data.map(item => `
            <div class="cms-item">
                <img src="${item.image_url}" alt="${item.caption || 'Menu'}" />
                <div class="cms-item-info">
                    <h4>${item.caption || 'Bez názvu'}</h4>
                    <p>Pridané: ${new Date(item.created_at).toLocaleDateString('sk-SK')}</p>
                </div>
                <button class="cms-delete" onclick="deleteMenuImage('${item.id}')">
                    Zmazať
                </button>
            </div>
        `).join('');

        console.log('[CMS] Načítané menu obrázky:', data.length);
    } catch (error) {
        console.error('[CMS] Chyba pri načítavaní menu:', error);
        showStatus('menuStatus', 'Chyba pri načítavaní menu: ' + error.message, 'error');
    }
}

async function loadCurrentStatus() {
    try {
        const { data, error } = await cmsSupabase
            .from('site_status')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        const statusSpan = document.getElementById('currentStatus');
        if (!statusSpan) return;

        if (data && data.length > 0) {
            const status = data[0];
            statusSpan.textContent = status.is_open ? 'Otvorené' : 'Zatvorené';
            
            const select = document.getElementById('statusSelect');
            if (select) {
                select.value = status.is_open ? 'open' : 'closed';
            }
        } else {
            statusSpan.textContent = 'Neznámy';
        }
    } catch (error) {
        console.error('[CMS] Chyba pri načítavaní stavu:', error);
        document.getElementById('currentStatus').textContent = 'Chyba';
    }
}

// Add functions
async function addGalleryImage() {
    if (!currentUser) return;
    
    const url = document.getElementById('galleryUrl').value.trim();
    const caption = document.getElementById('galleryCaption').value.trim();

    if (!url) {
        showStatus('galleryStatus', 'Zadajte URL obrázka', 'error');
        return;
    }

    try {
        const { error } = await cmsSupabase
            .from('gallery')
            .insert([{ url, caption: caption || null }]);

        if (error) throw error;

        showStatus('galleryStatus', 'Obrázok pridaný do galérie', 'success');
        document.getElementById('galleryUrl').value = '';
        document.getElementById('galleryCaption').value = '';
        loadGalleryImages();
    } catch (error) {
        console.error('[CMS] Chyba pri pridávaní do galérie:', error);
        showStatus('galleryStatus', 'Chyba: ' + error.message, 'error');
    }
}

async function addMenuImage() {
    if (!currentUser) return;
    
    const url = document.getElementById('menuUrl').value.trim();
    const caption = document.getElementById('menuCaption').value.trim();

    if (!url) {
        showStatus('menuStatus', 'Zadajte URL obrázka', 'error');
        return;
    }

    try {
        const { error } = await cmsSupabase
            .from('menu_images')
            .insert([{ image_url: url, caption: caption || null }]);

        if (error) throw error;

        showStatus('menuStatus', 'Obrázok pridaný do menu', 'success');
        document.getElementById('menuUrl').value = '';
        document.getElementById('menuCaption').value = '';
        loadMenuImages();
    } catch (error) {
        console.error('[CMS] Chyba pri pridávaní do menu:', error);
        showStatus('menuStatus', 'Chyba: ' + error.message, 'error');
    }
}

// Delete functions
async function deleteGalleryImage(id) {
    if (!currentUser || !confirm('Naozaj chcete zmazať tento obrázok z galérie?')) return;

    try {
        const { error } = await cmsSupabase
            .from('gallery')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showStatus('galleryStatus', 'Obrázok zmazaný z galérie', 'success');
        loadGalleryImages();
    } catch (error) {
        console.error('[CMS] Chyba pri mazaní z galérie:', error);
        showStatus('galleryStatus', 'Chyba pri mazaní: ' + error.message, 'error');
    }
}

async function deleteMenuImage(id) {
    if (!currentUser || !confirm('Naozaj chcete zmazať tento obrázok z menu?')) return;

    try {
        const { error } = await cmsSupabase
            .from('menu_images')
            .delete()
            .eq('id', id);

        if (error) throw error;

        showStatus('menuStatus', 'Obrázok zmazaný z menu', 'success');
        loadMenuImages();
    } catch (error) {
        console.error('[CMS] Chyba pri mazaní z menu:', error);
        showStatus('menuStatus', 'Chyba pri mazaní: ' + error.message, 'error');
    }
}

// Status update
async function updateSiteStatus() {
    if (!currentUser) return;
    
    const isOpen = document.getElementById('statusSelect').value === 'open';

    try {
        const { error } = await cmsSupabase
            .from('site_status')
            .upsert([{ 
                id: 1, // Používame fixné ID
                is_open: isOpen,
                updated_at: new Date().toISOString()
            }]);

        if (error) throw error;

        showStatus('statusUpdateResult', `Stav aktualizovaný: ${isOpen ? 'Otvorené' : 'Zatvorené'}`, 'success');
        loadCurrentStatus();
    } catch (error) {
        console.error('[CMS] Chyba pri aktualizácii stavu:', error);
        showStatus('statusUpdateResult', 'Chyba pri aktualizácii: ' + error.message, 'error');
    }
}

// Utility functions
function showStatus(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.innerHTML = `<div class="cms-status ${type}">${message}</div>`;
    setTimeout(() => {
        element.innerHTML = '';
    }, 5000);
}

function showError(message) {
    console.error('[CMS] Error:', message);
    alert('CMS Chyba: ' + message);
}

// Make functions globally available
window.addGalleryImage = addGalleryImage;
window.addMenuImage = addMenuImage;
window.deleteGalleryImage = deleteGalleryImage;
window.deleteMenuImage = deleteMenuImage;
window.updateSiteStatus = updateSiteStatus;