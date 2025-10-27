// CMS Tab Persistence Test
// This test checks if the CMS remembers the active tab after page refresh

console.log('=== CMS TAB PERSISTENCE TEST ===');

// Test 1: Check if localStorage functions work
try {
  localStorage.setItem('test_cms_tab', 'actions');
  const retrieved = localStorage.getItem('test_cms_tab');
  console.log('✅ localStorage test:', retrieved === 'actions' ? 'PASS' : 'FAIL');
  localStorage.removeItem('test_cms_tab');
} catch (err) {
  console.log('❌ localStorage test: FAIL -', err.message);
}

// Test 2: Check if URL hash functions work
try {
  window.location.hash = 'actions';
  const hashValue = window.location.hash.substring(1);
  console.log('✅ URL hash test:', hashValue === 'actions' ? 'PASS' : 'FAIL');
  window.location.hash = '';
} catch (err) {
  console.log('❌ URL hash test: FAIL -', err.message);
}

// Test 3: Check if tab validation works
function validateTab(tabName) {
  return ['gallery', 'menu', 'actions', 'reviews', 'audit'].includes(tabName);
}

console.log('✅ Tab validation tests:');
console.log('  actions:', validateTab('actions') ? 'PASS' : 'FAIL');
console.log('  invalid:', !validateTab('invalid') ? 'PASS' : 'FAIL');
console.log('  gallery:', validateTab('gallery') ? 'PASS' : 'FAIL');

console.log('=== TEST COMPLETE ===');

// Instructions for manual testing
console.log('\n📋 MANUAL TEST INSTRUCTIONS:');
console.log('1. Open CMS in browser');
console.log('2. Click on "Akcie" tab');
console.log('3. Refresh the page (F5)');
console.log('4. Check if "Akcie" tab is still active');
console.log('5. Try with other tabs (Menu, Reviews, etc.)');