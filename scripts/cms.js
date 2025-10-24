// CMS JavaScript Functions for U Dvou Šerifů
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

// Authentication helper - now simplified since RLS is disabled

async function checkAuthentication() {
  const sessionToken = localStorage.getItem('cms_session_token');
  const userId = localStorage.getItem('cms_user_id');
  const username = localStorage.getItem('cms_username');

  if (!sessionToken || !userId || !username) {
    return false;
  }

  // Set current user info (zjednoduší sa bez DB validácie)
  currentUser = {
    id: userId,
    username: username,
    email: username + '@cms.local'
  };

  // Update UI
  const userEl = document.getElementById('currentUser');
  if (userEl) {
    userEl.textContent = `Prihlásený: ${username}`;
  }
  
  return true;
}

function setupForms() {
  // Gallery form
  document.getElementById('galleryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await addGalleryItem();
  });

  // Menu form - disable Enter submit and require button click
  const menuForm = document.getElementById('menuForm');
  menuForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent enter key submission
  });
  
  menuForm.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent Enter key from submitting
      return false;
    }
  });

  // Actions form
  document.getElementById('actionsForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    await addAction();
  });
  
  // Setup reviews event listeners
  setupReviewsEventListeners();
}

// Tab switching
function showTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.cms-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');

  // Update panels
  document.querySelectorAll('.cms-panel').forEach(panel => {
    panel.classList.remove('active');
    panel.style.display = 'none';
  });
  
  const targetPanel = document.getElementById(`${tabName}-panel`);
  if (targetPanel) {
    targetPanel.classList.add('active');
    targetPanel.style.display = 'block';
    
    // Load data when tab is opened
    if (tabName === 'audit') {
      loadAuditLog();
    } else if (tabName === 'reviews') {
      loadReviews();
      updateReviewsStats();
    }
  }
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
        filename: url.split('/').pop() || 'image',
        url: url,
        caption: caption || null,
        uploader: currentUser?.username || 'Neznámy',
        sort_order: 0,
        created_by: currentUser?.id || null,
        updated_by: currentUser?.id || null
      })
      .select()
      .single();

    if (error) throw error;

    showMessage('success', 'Obrázok bol úspešne pridaný do galérie', 'galleryMessage');
    document.getElementById('galleryForm').reset();
    
    // Log activity
    await logActivity('CREATE', 'gallery', data.id, null, { url, caption });
    
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
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    loadingEl.style.display = 'none';
    
    if (data && data.length > 0) {
      data.forEach(item => {
        itemsEl.appendChild(createGalleryItemCard(item));
      });
      setupDragAndDrop(itemsEl, 'gallery');
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
  card.className = 'item-card draggable';
  card.draggable = true;
  card.dataset.itemId = item.id;
  card.dataset.itemType = 'gallery';
  
  const createdBy = item.uploader || 'Neznámy';
  const createdDate = new Date(item.created_at).toLocaleDateString('sk-SK');
  
  card.innerHTML = `
    <div class="drag-handle">⋮⋮ DRAG</div>
    <img src="${item.url}" alt="${item.caption || 'Gallery image'}" class="item-image" onerror="this.src='assets/logo.png'">
    <h4>${item.caption || 'Bez popisu'}</h4>
    <div class="user-info">
      <div class="user-avatar">${createdBy.charAt(0).toUpperCase()}</div>
      <span>Pridal: <strong>${createdBy}</strong></span>
    </div>
    <p><small>Dátum: ${createdDate}</small></p>
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
    
    // Log activity
    await logActivity('DELETE', 'gallery', itemId);
    
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
        sort_order: 0,
        created_by: currentUser?.id || null,
        updated_by: currentUser?.id || null
      })
      .select()
      .single();

    if (error) throw error;

    showMessage('success', 'Menu obrázok bol úspešne pridaný', 'menuMessage');
    document.getElementById('menuForm').reset();
    
    // Log activity
    await logActivity('CREATE', 'menu_images', data.id, null, { image_url: url, caption });
    
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
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    loadingEl.style.display = 'none';
    
    if (data && data.length > 0) {
      data.forEach(item => {
        itemsEl.appendChild(createMenuItemCard(item));
      });
      setupDragAndDrop(itemsEl, 'menu_images');
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
  card.className = 'item-card draggable';
  card.draggable = true;
  card.dataset.itemId = item.id;
  card.dataset.itemType = 'menu_images';
  
  card.innerHTML = `
    <div class="drag-handle">⋮⋮ DRAG</div>
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

  console.log('[DELETE MENU] Starting delete for itemId:', itemId);

  try {
    const { error } = await supabaseClient
      .from('menu_images')
      .delete()
      .eq('id', itemId);

    if (error) throw error;

    console.log('[DELETE MENU] Successfully deleted from database');
    showMessage('success', 'Menu obrázok bol zmazaný', 'menuMessage');
    
    // Log activity
    console.log('[DELETE MENU] Calling logActivity...');
    await logActivity('DELETE', 'menu_images', itemId);
    console.log('[DELETE MENU] logActivity completed');
    
    loadMenuItems();
  } catch (err) {
    console.error('Error deleting menu item:', err);
    showMessage('error', 'Chyba pri mazaní menu obrázka: ' + err.message, 'menuMessage');
  }
}

// Actions functions
async function addAction() {
  const form = document.getElementById('actionsForm');
  const editId = form.dataset.editId;
  const isEdit = !!editId;
  
  const title = document.getElementById('actionTitle').value.trim();
  const description = document.getElementById('actionDescription').value.trim();
  const imageUrl = document.getElementById('actionImageUrl').value.trim();
  const imageBase64 = document.getElementById('actionImageBase64').value.trim();
  const startDate = document.getElementById('actionStartDate').value;
  const isSingleDay = document.getElementById('actionSingleDay').checked;
  const endDate = isSingleDay ? null : document.getElementById('actionEndDate').value;
  
  // Use base64 if available, otherwise use URL
  const finalImageValue = imageBase64 || imageUrl || null;

  if (!title) {
    showMessage('error', 'Názov akcie je povinný', 'actionsMessage');
    return;
  }

  try {
    let data, error;
    
    if (isEdit) {
      // Update existing action
      ({ data, error } = await supabaseClient
        .from('cms_actions')
        .update({
          title: title,
          description: description || null,
          image_url: finalImageValue,
          start_date: startDate || null,
          end_date: endDate || null,
          updated_by: currentUser?.id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editId)
        .select()
        .single());
      
      if (error) throw error;
      
      showMessage('success', 'Akcia bola úspešne aktualizovaná', 'actionsMessage');
      
      // Log activity
      await logActivity('UPDATE', 'cms_actions', editId, null, { title, description, image_url: finalImageValue });
      
    } else {
      // Create new action
      ({ data, error } = await supabaseClient
        .from('cms_actions')
        .insert({
          title: title,
          description: description || null,
          image_url: finalImageValue || null,
          start_date: startDate || null,
          end_date: endDate || null,
          is_active: true,
          sort_order: 0,
          created_by: currentUser?.id || null,
          updated_by: currentUser?.id || null
        })
        .select()
        .single());

      if (error) throw error;

      showMessage('success', 'Akcia bola úspešne pridaná', 'actionsMessage');
      
      // Log activity
      await logActivity('CREATE', 'cms_actions', data.id, null, { title, description, image_url: finalImageValue });
    }

    // Reset form
    cancelEditAction('Pridať akciu');
    loadActionsItems();
    
  } catch (err) {
    console.error(`Error ${isEdit ? 'updating' : 'adding'} action:`, err);
    showMessage('error', `Chyba pri ${isEdit ? 'aktualizácii' : 'pridávaní'} akcie: ` + err.message, 'actionsMessage');
  }
}

async function loadActionsItems() {
  const loadingEl = document.getElementById('actionsLoading');
  const itemsEl = document.getElementById('actionsItems');
  
  loadingEl.style.display = 'block';
  itemsEl.innerHTML = '';

  try {
    console.log('[CMS] Loading actions from database...');
    const { data, error } = await supabaseClient
      .from('cms_actions')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[CMS] Database error:', error);
      console.error('[CMS] Error details:', error.message, error.code);
      
      loadingEl.style.display = 'none';
      itemsEl.innerHTML = `<p style="color: red;">Databázová chyba: ${error.message}</p>`;
      return;
    }
    
    console.log('[CMS] Actions loaded:', data?.length || 0);

    loadingEl.style.display = 'none';
    
    if (data && data.length > 0) {
      data.forEach(item => {
        itemsEl.appendChild(createActionItemCard(item));
      });
      setupDragAndDrop(itemsEl, 'cms_actions');
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
  card.className = 'item-card draggable';
  card.draggable = true;
  card.dataset.itemId = item.id;
  card.dataset.itemType = 'cms_actions';
  
  const statusClass = item.is_active ? 'status-active' : 'status-inactive';
  const statusText = item.is_active ? 'Aktívna' : 'Neaktívna';
  
  const imageHTML = item.image_url ? 
    `<img src="${item.image_url}" alt="${item.title}" class="item-image" onerror="this.src='assets/logo.png'">` : '';
  
  const dateRange = (item.start_date || item.end_date) ? 
    `<p><small>${item.start_date || ''} - ${item.end_date || ''}</small></p>` : '';
  
  card.innerHTML = `
    <div class="drag-handle">⋮⋮ DRAG</div>
    ${imageHTML}
    <h4>${item.title}</h4>
    <p>${item.description || 'Bez popisu'}</p>
    ${dateRange}
    <div class="status-indicator ${statusClass}">${statusText}</div>
    <p><small>Pridané: ${new Date(item.created_at).toLocaleDateString('sk-SK')}</small></p>
    <div class="item-actions">
      <button class="btn btn-secondary" onclick="editAction('${item.id}')">Editovať</button>
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

// Edit action function
async function editAction(actionId) {
  try {
    // Fetch action details
    const { data, error } = await supabaseClient
      .from('cms_actions')
      .select('*')
      .eq('id', actionId)
      .single();

    if (error) throw error;
    if (!data) {
      showMessage('error', 'Akcia nebola nájdená', 'actionsMessage');
      return;
    }

    // Fill form with existing data
    document.getElementById('actionTitle').value = data.title || '';
    document.getElementById('actionDescription').value = data.description || '';
    document.getElementById('actionImageUrl').value = data.image_url || '';
    document.getElementById('actionStartDate').value = data.start_date || '';
    document.getElementById('actionEndDate').value = data.end_date || '';
    
    // Set single day checkbox based on whether end_date exists
    const singleDayCheckbox = document.getElementById('actionSingleDay');
    const hasSingleDay = data.start_date && !data.end_date;
    singleDayCheckbox.checked = hasSingleDay;
    
    // Update UI based on single day setting
    toggleDateFields();

    // Show image preview if exists
    if (data.image_url) {
      const preview = document.getElementById('actionImagePreview');
      preview.innerHTML = `<img src="${data.image_url}" alt="Náhľad">`;
      preview.classList.add('show');
    }

    // Change form to edit mode
    const form = document.getElementById('actionsForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Aktualizovať akciu';
    submitBtn.style.background = '#28a745';
    
    // Create cancel button
    if (!form.querySelector('.edit-cancel-btn')) {
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn btn-secondary edit-cancel-btn';
      cancelBtn.textContent = 'Zrušiť';
      cancelBtn.style.marginLeft = '8px';
      cancelBtn.onclick = () => cancelEditAction(originalText);
      submitBtn.parentNode.appendChild(cancelBtn);
    }

    // Store edit ID for form submission
    form.dataset.editId = actionId;
    
    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth' });
    showMessage('info', 'Akcia načítaná pre úpravu', 'actionsMessage');

  } catch (err) {
    console.error('Error loading action for edit:', err);
    showMessage('error', 'Chyba pri načítavaní akcie: ' + err.message, 'actionsMessage');
  }
}

function cancelEditAction(originalText) {
  const form = document.getElementById('actionsForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  const cancelBtn = form.querySelector('.edit-cancel-btn');
  
  // Reset form
  form.reset();
  delete form.dataset.editId;
  
  // Reset single day checkbox and date fields
  document.getElementById('actionSingleDay').checked = false;
  toggleDateFields();
  
  // Reset button text and style
  submitBtn.textContent = originalText || 'Pridať akciu';
  submitBtn.style.background = '';
  
  // Remove cancel button
  if (cancelBtn) cancelBtn.remove();
  
  // Clear image preview
  const preview = document.getElementById('actionImagePreview');
  preview.innerHTML = '';
  preview.classList.remove('show');
  
  showMessage('info', 'Úprava zrušená', 'actionsMessage');
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
    
    // Log activity
    await logActivity('DELETE', 'cms_actions', actionId);
    
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

// Drag and drop functionality
function setupDragAndDrop(container, tableType) {
  let draggedElement = null;
  let dragOverElement = null;

  // Add drag event listeners to all draggable items
  const draggableItems = container.querySelectorAll('.draggable');
  
  draggableItems.forEach(item => {
    // Make the entire item draggable, not just the handle
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragenter', handleDragEnter);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
    
    // Allow dragging from anywhere on the card
    item.style.cursor = 'move';
  });

  function handleDragStart(e) {
    draggedElement = e.currentTarget; // Use currentTarget to get the card element
    draggedElement.style.opacity = '0.5';
    draggedElement.classList.add('dragging');
    
    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', draggedElement.outerHTML);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    e.preventDefault();
    const target = e.currentTarget;
    if (target.classList.contains('draggable') && target !== draggedElement) {
      // Remove drag-over from all items first
      container.querySelectorAll('.draggable').forEach(item => {
        item.classList.remove('drag-over');
      });
      
      target.classList.add('drag-over');
      dragOverElement = target;
    }
  }

  function handleDragLeave(e) {
    const target = e.currentTarget;
    if (target.classList.contains('draggable')) {
      target.classList.remove('drag-over');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    
    if (dragOverElement && draggedElement && dragOverElement !== draggedElement) {
      // Get the container and all draggable items
      const allItems = Array.from(container.querySelectorAll('.draggable'));
      const draggedIndex = allItems.indexOf(draggedElement);
      const targetIndex = allItems.indexOf(dragOverElement);

      // Move the element in DOM
      if (draggedIndex < targetIndex) {
        dragOverElement.parentNode.insertBefore(draggedElement, dragOverElement.nextSibling);
      } else {
        dragOverElement.parentNode.insertBefore(draggedElement, dragOverElement);
      }

      // Highlight save button after change
      highlightSaveButton(tableType);
      showMessage('info', 'Poradie bolo zmenené. Kliknite na "Uložiť poradie" pre potvrdenie.');
    }

    // Clean up all elements immediately after drop
    container.querySelectorAll('.draggable').forEach(item => {
      item.classList.remove('drag-over', 'dragging');
      item.style.opacity = '1';
      item.style.transform = '';
      item.style.zIndex = '';
    });
    
    if (dragOverElement) {
      dragOverElement = null;
    }
    if (draggedElement) {
      draggedElement = null;
    }
  }

  function handleDragEnd(e) {
    const element = e.currentTarget;
    
    // Reset all styles to normal
    element.style.opacity = '1';
    element.style.transform = '';
    element.style.zIndex = '';
    element.classList.remove('dragging');
    
    // Clean up any remaining drag-over classes from all items
    container.querySelectorAll('.draggable').forEach(item => {
      item.classList.remove('drag-over');
      item.style.opacity = '1';
      item.style.transform = '';
      item.style.zIndex = '';
    });
    
    // Reset variables
    draggedElement = null;
    dragOverElement = null;
  }
}

async function saveNewOrder(container, tableType) {
  const items = Array.from(container.querySelectorAll('.draggable'));
  const updates = [];

  items.forEach((item, index) => {
    updates.push({
      id: item.dataset.itemId,
      sort_order: index
    });
  });

  try {
    // Update each item with new sort_order
    for (const update of updates) {
      const { error } = await supabaseClient
        .from(tableType)
        .update({ 
          sort_order: update.sort_order,
          updated_by: currentUser?.id || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id);

      if (error) throw error;
    }

    showMessage('success', `Poradie bolo úspešne uložené! (Aktualizované ${updates.length} položiek)`);
    
    // Log activity for order update
    await logActivity('UPDATE', tableType, null, null, { 
      action: 'reorder', 
      items_count: updates.length,
      table: tableType 
    });
    
    // Reset button after successful save
    let buttonId;
    if (tableType === 'gallery') buttonId = 'saveGalleryOrder';
    else if (tableType === 'menu_images') buttonId = 'saveMenuOrder';  
    else if (tableType === 'cms_actions') buttonId = 'saveActionsOrder';
    if (buttonId) resetSaveButton(buttonId, tableType);
    
    // Optional: Trigger real-time update for other users
    console.log(`Updated sort order for ${updates.length} items in ${tableType}`);
  } catch (err) {
    console.error('Error saving new order:', err);
    showMessage('error', 'Chyba pri ukladaní poradia: ' + err.message);
    
    // Reload the items to restore original order
    if (tableType === 'gallery') {
      loadGalleryItems();
    } else if (tableType === 'menu_images') {
      loadMenuItems();
    } else if (tableType === 'cms_actions') {
      loadActionsItems();
    }
  }
}

// Manual save order functions
async function saveGalleryOrder() {
  const container = document.getElementById('galleryItems');
  await saveNewOrder(container, 'gallery');
}

async function saveMenuOrder() {
  const container = document.getElementById('menuItems');
  await saveNewOrder(container, 'menu_images');
}

async function saveActionsOrder() {
  const container = document.getElementById('actionsItems');
  await saveNewOrder(container, 'cms_actions');
}

function highlightSaveButton(tableType) {
  let buttonId;
  if (tableType === 'gallery') {
    buttonId = 'saveGalleryOrder';
  } else if (tableType === 'menu_images') {
    buttonId = 'saveMenuOrder';
  } else if (tableType === 'cms_actions') {
    buttonId = 'saveActionsOrder';
  }
  
  if (buttonId) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.classList.add('btn-highlight');
      button.innerHTML = '💾 Uložiť zmeny (ZMENENÉ!)';
    }
  }
}

function showOrderButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.style.display = 'block';
  }
}

function resetSaveButton(buttonId, tableType) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.classList.remove('btn-highlight');
    if (tableType === 'gallery') {
      button.innerHTML = '💾 Uložiť poradie galérie';
    } else if (tableType === 'menu_images') {
      button.innerHTML = '💾 Uložiť poradie menu';
    } else if (tableType === 'cms_actions') {
      button.innerHTML = '💾 Uložiť poradie akcií';
    }
  }
}

function hideOrderButton(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.style.display = 'none';
  }
}

// Audit Log Functions
async function loadAuditLog() {
  const loadingEl = document.getElementById('auditLoading');
  const logEl = document.getElementById('auditLog');
  const actionFilter = document.getElementById('auditFilter').value;
  const tableFilter = document.getElementById('auditTable').value;
  
  loadingEl.style.display = 'block';
  logEl.innerHTML = '';

  try {
    let query = supabaseClient
      .from('cms_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (actionFilter) {
      query = query.eq('action', actionFilter);
    }
    
    if (tableFilter) {
      query = query.eq('table_name', tableFilter);
    }

    const { data, error } = await query;

    if (error) throw error;

    loadingEl.style.display = 'none';
    
    if (!data || data.length === 0) {
      logEl.innerHTML = '<p class="no-logs">Žiadne záznamy audit logu</p>';
      return;
    }

    data.forEach(log => {
      logEl.appendChild(createAuditLogItem(log));
    });
    
  } catch (err) {
    console.error('Error loading audit log:', err);
    loadingEl.style.display = 'none';
    logEl.innerHTML = '<p class="error">Chyba pri načítavaní audit logu</p>';
  }
}

function createAuditLogItem(log) {
  const item = document.createElement('div');
  item.className = 'audit-item';
  
  const username = log.username || 'System';
  const actionText = getActionText(log.action, log.table_name);
  const timeAgo = getTimeAgo(log.created_at);
  
  item.innerHTML = `
    <div class="audit-action ${log.action}">${log.action}</div>
    <div class="audit-details">
      <div class="user-info">
        <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
        <span><strong>${username}</strong> ${actionText}</span>
      </div>
      ${log.record_id ? `<small>ID: ${log.record_id.substring(0, 8)}...</small>` : ''}
    </div>
    <div class="audit-time">${timeAgo}</div>
  `;
  
  return item;
}

function getActionText(action, tableName) {
  const tableNames = {
    'gallery': 'galérii',
    'menu_images': 'menu obrázkov', 
    'cms_actions': 'akcií',
    'cms_users': 'používateľov'
  };
  
  const actions = {
    'CREATE': 'pridal položku do',
    'UPDATE': 'upravil položku v',
    'DELETE': 'zmazal položku z',
    'LOGIN': 'prihlásil sa do systému'
  };
  
  if (action === 'LOGIN') {
    return actions[action];
  }
  
  return `${actions[action]} ${tableNames[tableName] || tableName}`;
}

function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Práve teraz';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} hod`;
  if (diffDays < 7) return `${diffDays} dní`;
  
  return date.toLocaleDateString('sk-SK');
}

// Log CMS activities
async function logActivity(action, tableName, recordId = null, oldData = null, newData = null) {
  console.log(`[AUDIT] Attempting to log: ${action} on ${tableName}, recordId: ${recordId}`);
  
  if (!currentUser) {
    console.warn('[AUDIT] No currentUser available for logging');
    return;
  }
  
  if (!supabaseClient) {
    console.warn('[AUDIT] No supabaseClient available for logging');
    return;
  }
  
  try {
    const logData = {
      user_id: currentUser.id,
      username: currentUser.username,
      action: action,
      table_name: tableName,
      record_id: recordId ? recordId.toString() : null,  // Konvertuj na string
      old_data: oldData,
      new_data: newData
    };
    
    console.log('[AUDIT] Inserting log data:', logData);
    
    const { data, error } = await supabaseClient
      .from('cms_audit_log')
      .insert(logData)
      .select();
      
    if (error) {
      console.error('[AUDIT] Database error:', error);
      throw error;
    }
    
    console.log(`[AUDIT] Successfully logged: ${action} on ${tableName}`, data);
  } catch (err) {
    console.error('[AUDIT] Failed to log activity:', err);
  }
}

// Reviews Management Functions
async function loadReviews() {
  const reviewsLoading = document.getElementById('reviewsLoading');
  const reviewsList = document.getElementById('reviewsList');
  const statusFilter = document.getElementById('reviewStatusFilter').value;
  const ratingFilter = document.getElementById('reviewRatingFilter').value;

  if (reviewsLoading) reviewsLoading.style.display = 'block';
  if (reviewsList) reviewsList.innerHTML = '';

  try {
    let query = supabaseClient.from('reviews').select('*');
    
    // Apply filters
    if (statusFilter === 'approved') {
      query = query.eq('is_approved', true);
    } else if (statusFilter === 'pending') {
      query = query.eq('is_approved', false);
    }
    
    if (ratingFilter !== 'all') {
      query = query.eq('rating', parseInt(ratingFilter));
    }
    
    const { data, error } = await query.order('date_created', { ascending: false });

    if (error) throw error;

    if (reviewsLoading) reviewsLoading.style.display = 'none';

    if (!data || data.length === 0) {
      reviewsList.innerHTML = '<p class="no-data">Žiadne recenzie neboli nájdené.</p>';
      return;
    }

    reviewsList.innerHTML = '';
    data.forEach(review => {
      const reviewCard = createReviewCmsCard(review);
      reviewsList.appendChild(reviewCard);
    });

    // Update statistics
    updateReviewsStats(data);

  } catch (err) {
    if (reviewsLoading) reviewsLoading.style.display = 'none';
    console.error('Error loading reviews:', err);
    showMessage('error', 'Chyba pri načítavaní recenzií: ' + err.message, 'reviewsMessage');
  }
}

function createReviewCmsCard(review) {
  const card = document.createElement('div');
  card.className = `review-cms-card ${review.is_approved ? 'approved' : 'pending'}`;
  
  const reviewDate = new Date(review.date_created).toLocaleDateString('sk-SK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const stars = '⭐'.repeat(review.rating);
  
  card.innerHTML = `
    <div class="review-cms-header">
      <div class="review-cms-customer">
        <div class="review-cms-avatar">
          ${review.customer_name.charAt(0).toUpperCase()}
        </div>
        <div class="review-cms-info">
          <h4>${escapeHtml(review.customer_name)}</h4>
          <div class="review-cms-rating">${stars} (${review.rating}/5)</div>
        </div>
      </div>
      <div class="review-cms-meta">
        <div class="review-cms-status ${review.is_approved ? 'approved' : 'pending'}">
          ${review.is_approved ? 'Schválené' : 'Čaká na schválenie'}
        </div>
        <div class="review-cms-date">${reviewDate}</div>
        ${review.discord_username ? `<div class="discord-info">Discord: ${escapeHtml(review.discord_username)}</div>` : ''}
      </div>
    </div>
    
    <div class="review-cms-content">
      <p>${escapeHtml(review.review_text)}</p>
    </div>
    
    <div class="review-cms-actions">
      ${!review.is_approved ? `
        <button class="btn-approve" onclick="approveReview('${review.id}')">
          ✓ Schváliť
        </button>
      ` : ''}
      <button class="btn-delete" onclick="deleteReview('${review.id}')">
        🗑️ Zmazať
      </button>
    </div>
  `;
  
  return card;
}

async function approveReview(reviewId) {
  try {
    const { error } = await supabaseClient
      .from('reviews')
      .update({ 
        is_approved: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', reviewId);

    if (error) throw error;

    showMessage('success', 'Recenzia bola schválená', 'reviewsMessage');
    
    // Log activity
    await logActivity('UPDATE', 'reviews', reviewId, null, { is_approved: true });
    
    loadReviews();
  } catch (err) {
    console.error('Error approving review:', err);
    showMessage('error', 'Chyba pri schvaľovaní recenzie: ' + err.message, 'reviewsMessage');
  }
}

async function deleteReview(reviewId) {
  if (!confirm('Naozaj chcete zmazať túto recenziu? Táto akcia sa nedá vrátiť späť.')) {
    return;
  }

  try {
    const { error } = await supabaseClient
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    showMessage('success', 'Recenzia bola úspešne zmazaná', 'reviewsMessage');
    
    // Log activity
    await logActivity('DELETE', 'reviews', reviewId, null, { deleted: true });
    
    loadReviews();
  } catch (err) {
    console.error('Error deleting review:', err);
    showMessage('error', 'Chyba pri mazaní recenzie: ' + err.message, 'reviewsMessage');
  }
}

async function deleteReview(reviewId) {
  if (!confirm('Naozaj chcete zmazať túto recenziu? Táto akcia sa nedá vrátiť.')) return;

  try {
    const { error } = await supabaseClient
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    showMessage('success', 'Recenzia bola zmazaná', 'reviewsMessage');
    
    // Log activity
    await logActivity('DELETE', 'reviews', reviewId);
    
    loadReviews();
  } catch (err) {
    console.error('Error deleting review:', err);
    showMessage('error', 'Chyba pri mazaní recenzie: ' + err.message, 'reviewsMessage');
  }
}

async function updateReviewsStats(allReviews = null) {
  try {
    if (!allReviews) {
      const { data, error } = await supabaseClient
        .from('reviews')
        .select('rating, is_approved');

      if (error) throw error;
      allReviews = data || [];
    }

    const totalReviews = allReviews.length;
    const approvedReviews = allReviews.filter(r => r.is_approved).length;
    const pendingReviews = totalReviews - approvedReviews;
    
    let averageRating = 0;
    if (approvedReviews > 0) {
      const approvedRatings = allReviews.filter(r => r.is_approved);
      const totalRating = approvedRatings.reduce((sum, r) => sum + r.rating, 0);
      averageRating = (totalRating / approvedRatings.length).toFixed(1);
    }

    // Update stats in UI
    const totalEl = document.getElementById('totalReviewsCount');
    const approvedEl = document.getElementById('approvedReviewsCount');
    const pendingEl = document.getElementById('pendingReviewsCount');
    const averageEl = document.getElementById('averageRatingCms');

    if (totalEl) totalEl.textContent = totalReviews;
    if (approvedEl) approvedEl.textContent = approvedReviews;
    if (pendingEl) pendingEl.textContent = pendingReviews;
    if (averageEl) averageEl.textContent = averageRating;

  } catch (err) {
    console.error('Error updating reviews stats:', err);
  }
}

// Setup reviews tab event listeners
function setupReviewsEventListeners() {
  const statusFilter = document.getElementById('reviewStatusFilter');
  const ratingFilter = document.getElementById('reviewRatingFilter');

  if (statusFilter) {
    statusFilter.addEventListener('change', loadReviews);
  }
  
  if (ratingFilter) {
    ratingFilter.addEventListener('change', loadReviews);
  }
}

// Utility function to escape HTML (needed for CMS)
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
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
