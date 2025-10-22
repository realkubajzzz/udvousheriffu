// CMS JavaScript Functions for U Dvou Sheriffů
// Handles authentication, CRUD operations, and UI interactions

let supabaseClient = null;
let currentUser = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initCMS();
});

async function initCMS() {
  // Initialize Supabase client
  if (window.SHERIFF_SUPABASE && window.SHERIFF_SUPABASE.url && window.SHERIFF_SUPABASE.key) {
    const createClient = window.createClient || (window.supabase && window.supabase.createClient);
    if (createClient) {
      supabaseClient = createClient(window.SHERIFF_SUPABASE.url, window.SHERIFF_SUPABASE.key);
    }
  }

  if (!supabaseClient) {
    showMessage('error', 'Supabase nie je nakonfigurovaný');
    return;
  }

  // Check authentication
  const isAuthenticated = await checkAuthentication();
  if (!isAuthenticated) {
    window.location.href = 'logincms.html';
    return;
  }

  // Initialize forms
  setupForms();
  
  // Load initial data
  loadGalleryItems();
  loadMenuItems();
  loadActionsItems();
}

async function checkAuthentication() {
  const sessionToken = localStorage.getItem('cms_session_token');
  const userId = localStorage.getItem('cms_user_id');
  const username = localStorage.getItem('cms_username');

  if (!sessionToken || !userId) {
    return false;
  }

  try {
    // Verify session in database
    const { data, error } = await supabaseClient
      .from('cms_sessions')
      .select('id, expires_at, user_id')
      .eq('session_token', sessionToken)
      .eq('user_id', userId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      // Invalid session
      localStorage.removeItem('cms_session_token');
      localStorage.removeItem('cms_user_id');
      localStorage.removeItem('cms_username');
      return false;
    }

    // Set current user info
    currentUser = {
      id: userId,
      username: username
    };

    // Update UI
    document.getElementById('currentUser').textContent = `Prihlásený: ${username}`;
    
    return true;
  } catch (err) {
    console.error('Authentication check failed:', err);
    return false;
  }
}

function setupForms() {
  // Gallery form
  document.getElementById('galleryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await addGalleryItem();
  });

  // Menu form
  document.getElementById('menuForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await addMenuItem();
  });

  // Actions form
  document.getElementById('actionsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await addAction();
  });
}

// Tab switching
function showTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.cms-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  // Update panels
  document.querySelectorAll('.cms-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById(`${tabName}-panel`).classList.add('active');
}

// Gallery functions
async function addGalleryItem() {
  const url = document.getElementById('galleryUrl').value.trim();
  const caption = document.getElementById('galleryCaption').value.trim();

  if (!url) {
    showMessage('error', 'URL obrázka je povinné', 'galleryMessage');
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('gallery')
      .insert({
        url: url,
        caption: caption || null,
        created_by: currentUser.id
      })
      .select()
      .single();

    if (error) throw error;

    showMessage('success', 'Obrázok bol úspešne pridaný do galérie', 'galleryMessage');
    document.getElementById('galleryForm').reset();
    loadGalleryItems();
  } catch (err) {
    console.error('Error adding gallery item:', err);
    showMessage('error', 'Chyba pri pridávaní obrázka: ' + err.message, 'galleryMessage');
  }
}

async function loadGalleryItems() {
  const loadingEl = document.getElementById('galleryLoading');
  const itemsEl = document.getElementById('galleryItems');
  
  loadingEl.style.display = 'block';
  itemsEl.innerHTML = '';

  try {
    const { data, error } = await supabaseClient
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    loadingEl.style.display = 'none';
    
    if (data && data.length > 0) {
      data.forEach(item => {
        itemsEl.appendChild(createGalleryItemCard(item));
      });
    } else {
      itemsEl.innerHTML = '<p>Žiadne obrázky v galérii</p>';
    }
  } catch (err) {
    console.error('Error loading gallery:', err);
    loadingEl.style.display = 'none';
    itemsEl.innerHTML = '<p>Chyba pri načítavaní galérie</p>';
  }
}

function createGalleryItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  
  card.innerHTML = `
    <img src="${item.url}" alt="${item.caption || 'Gallery image'}" class="item-image" onerror="this.src='assets/logo.png'">
    <h4>${item.caption || 'Bez popisu'}</h4>
    <p><small>Pridané: ${new Date(item.created_at).toLocaleDateString('sk-SK')}</small></p>
    <div class="item-actions">
      <button class="btn btn-danger" onclick="deleteGalleryItem('${item.id}')">Zmazať</button>
    </div>
  `;
  
  return card;
}

async function deleteGalleryItem(itemId) {
  if (!confirm('Naozaj chcete zmazať tento obrázok z galérie?')) return;

  try {
    const { error } = await supabaseClient
      .from('gallery')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    showMessage('success', 'Obrázok bol zmazaný z galérie', 'galleryMessage');
    loadGalleryItems();
  } catch (err) {
    console.error('Error deleting gallery item:', err);
    showMessage('error', 'Chyba pri mazaní obrázka: ' + err.message, 'galleryMessage');
  }
}

// Menu functions
async function addMenuItem() {
  const url = document.getElementById('menuUrl').value.trim();
  const caption = document.getElementById('menuCaption').value.trim();

  if (!url) {
    showMessage('error', 'URL obrázka je povinné', 'menuMessage');
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('menu_images')
      .insert({
        image_url: url,
        caption: caption || null,
        created_by: currentUser.id
      })
      .select()
      .single();

    if (error) throw error;

    showMessage('success', 'Menu obrázok bol úspešne pridaný', 'menuMessage');
    document.getElementById('menuForm').reset();
    loadMenuItems();
  } catch (err) {
    console.error('Error adding menu item:', err);
    showMessage('error', 'Chyba pri pridávaní menu obrázka: ' + err.message, 'menuMessage');
  }
}

async function loadMenuItems() {
  const loadingEl = document.getElementById('menuLoading');
  const itemsEl = document.getElementById('menuItems');
  
  loadingEl.style.display = 'block';
  itemsEl.innerHTML = '';

  try {
    const { data, error } = await supabaseClient
      .from('menu_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    loadingEl.style.display = 'none';
    
    if (data && data.length > 0) {
      data.forEach(item => {
        itemsEl.appendChild(createMenuItemCard(item));
      });
    } else {
      itemsEl.innerHTML = '<p>Žiadne menu obrázky</p>';
    }
  } catch (err) {
    console.error('Error loading menu:', err);
    loadingEl.style.display = 'none';
    itemsEl.innerHTML = '<p>Chyba pri načítavaní menu obrázkov</p>';
  }
}

function createMenuItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  
  card.innerHTML = `
    <img src="${item.image_url}" alt="${item.caption || 'Menu image'}" class="item-image" onerror="this.src='assets/logo.png'">
    <h4>${item.caption || 'Bez názvu'}</h4>
    <p><small>Pridané: ${new Date(item.created_at).toLocaleDateString('sk-SK')}</small></p>
    <div class="item-actions">
      <button class="btn btn-danger" onclick="deleteMenuItem('${item.id}')">Zmazať</button>
    </div>
  `;
  
  return card;
}

async function deleteMenuItem(itemId) {
  if (!confirm('Naozaj chcete zmazať tento menu obrázok?')) return;

  try {
    const { error } = await supabaseClient
      .from('menu_images')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    showMessage('success', 'Menu obrázok bol zmazaný', 'menuMessage');
    loadMenuItems();
  } catch (err) {
    console.error('Error deleting menu item:', err);
    showMessage('error', 'Chyba pri mazaní menu obrázka: ' + err.message, 'menuMessage');
  }
}

// Actions functions
async function addAction() {
  const title = document.getElementById('actionTitle').value.trim();
  const description = document.getElementById('actionDescription').value.trim();
  const imageUrl = document.getElementById('actionImageUrl').value.trim();
  const startDate = document.getElementById('actionStartDate').value;
  const endDate = document.getElementById('actionEndDate').value;

  if (!title) {
    showMessage('error', 'Názov akcie je povinný', 'actionsMessage');
    return;
  }

  try {
    const { data, error } = await supabaseClient
      .from('cms_actions')
      .insert({
        title: title,
        description: description || null,
        image_url: imageUrl || null,
        start_date: startDate || null,
        end_date: endDate || null,
        created_by: currentUser.id
      })
      .select()
      .single();

    if (error) throw error;

    showMessage('success', 'Akcia bola úspešne pridaná', 'actionsMessage');
    document.getElementById('actionsForm').reset();
    loadActionsItems();
  } catch (err) {
    console.error('Error adding action:', err);
    showMessage('error', 'Chyba pri pridávaní akcie: ' + err.message, 'actionsMessage');
  }
}

async function loadActionsItems() {
  const loadingEl = document.getElementById('actionsLoading');
  const itemsEl = document.getElementById('actionsItems');
  
  loadingEl.style.display = 'block';
  itemsEl.innerHTML = '';

  try {
    const { data, error } = await supabaseClient
      .from('cms_actions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    loadingEl.style.display = 'none';
    
    if (data && data.length > 0) {
      data.forEach(item => {
        itemsEl.appendChild(createActionItemCard(item));
      });
    } else {
      itemsEl.innerHTML = '<p>Žiadne akcie</p>';
    }
  } catch (err) {
    console.error('Error loading actions:', err);
    loadingEl.style.display = 'none';
    itemsEl.innerHTML = '<p>Chyba pri načítavaní akcií</p>';
  }
}

function createActionItemCard(item) {
  const card = document.createElement('div');
  card.className = 'item-card';
  
  const statusClass = item.is_active ? 'status-active' : 'status-inactive';
  const statusText = item.is_active ? 'Aktívna' : 'Neaktívna';
  
  const imageHTML = item.image_url ? 
    `<img src="${item.image_url}" alt="${item.title}" class="item-image" onerror="this.src='assets/logo.png'">` : '';
  
  const dateRange = (item.start_date || item.end_date) ? 
    `<p><small>${item.start_date || ''} - ${item.end_date || ''}</small></p>` : '';
  
  card.innerHTML = `
    ${imageHTML}
    <h4>${item.title}</h4>
    <p>${item.description || 'Bez popisu'}</p>
    ${dateRange}
    <div class="status-indicator ${statusClass}">${statusText}</div>
    <p><small>Pridané: ${new Date(item.created_at).toLocaleDateString('sk-SK')}</small></p>
    <div class="item-actions">
      <button class="btn btn-primary" onclick="toggleActionStatus('${item.id}', ${!item.is_active})">
        ${item.is_active ? 'Deaktivovať' : 'Aktivovať'}
      </button>
      <button class="btn btn-danger" onclick="deleteAction('${item.id}')">Zmazať</button>
    </div>
  `;
  
  return card;
}

async function toggleActionStatus(actionId, newStatus) {
  try {
    const { error } = await supabaseClient
      .from('cms_actions')
      .update({ 
        is_active: newStatus,
        updated_by: currentUser.id
      })
      .eq('id', actionId);

    if (error) throw error;

    showMessage('success', `Akcia bola ${newStatus ? 'aktivovaná' : 'deaktivovaná'}`, 'actionsMessage');
    loadActionsItems();
  } catch (err) {
    console.error('Error updating action status:', err);
    showMessage('error', 'Chyba pri aktualizácii stavu akcie: ' + err.message, 'actionsMessage');
  }
}

async function deleteAction(actionId) {
  if (!confirm('Naozaj chcete zmazať túto akciu?')) return;

  try {
    const { error } = await supabaseClient
      .from('cms_actions')
      .delete()
      .eq('id', actionId);

    if (error) throw error;

    showMessage('success', 'Akcia bola zmazaná', 'actionsMessage');
    loadActionsItems();
  } catch (err) {
    console.error('Error deleting action:', err);
    showMessage('error', 'Chyba pri mazaní akcie: ' + err.message, 'actionsMessage');
  }
}

// Utility functions
function showMessage(type, message, containerId = null) {
  const messageHTML = `<div class="message ${type}">${message}</div>`;
  
  if (containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = messageHTML;
    
    // Auto-hide success messages
    if (type === 'success') {
      setTimeout(() => {
        container.innerHTML = '';
      }, 3000);
    }
  } else {
    // Show global message
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}

async function logout() {
  if (!confirm('Naozaj sa chcete odhlásiť?')) return;

  const sessionToken = localStorage.getItem('cms_session_token');
  
  if (sessionToken && supabaseClient) {
    try {
      // Delete session from database
      await supabaseClient
        .from('cms_sessions')
        .delete()
        .eq('session_token', sessionToken);
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }

  // Clear local storage
  localStorage.removeItem('cms_session_token');
  localStorage.removeItem('cms_user_id');
  localStorage.removeItem('cms_username');

  // Redirect to login
  window.location.href = 'logincms.html';
}

// Clean expired sessions periodically
setInterval(async function() {
  if (supabaseClient) {
    try {
      await supabaseClient.rpc('clean_expired_cms_sessions');
    } catch (err) {
      console.error('Error cleaning expired sessions:', err);
    }
  }
}, 30 * 60 * 1000); // Every 30 minutes
