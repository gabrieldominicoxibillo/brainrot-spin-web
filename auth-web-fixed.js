// Web-only admin authentication with session management
let supabaseClient = null;

// Wait for Supabase to be ready
function waitForSupabase() {
  return new Promise((resolve) => {
    const checkSupabase = setInterval(() => {
      if (window.supabase && window.supabase.createClient) {
        clearInterval(checkSupabase);
        const SUPABASE_URL = 'https://sjxxwyucnkmsmeumging.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqeHh3eXVjbmttc21ldW1naW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMzkwODYsImV4cCI6MjA3OTcxNTA4Nn0.CHV-72F5mDU_W-rVcdFhsW2VsuRXNUFac-ovchreKDQ';
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        resolve();
      }
    }, 100);
  });
}

// DOM elements
const homepage = document.getElementById('homepage');
const adminPasswordModal = document.getElementById('admin-password-modal');
const gameInterface = document.getElementById('game-interface');

// Buttons
const adminHomeBtn = document.getElementById('admin-home-btn');
const adminPasswordInput = document.getElementById('admin-password-input');
const adminPasswordSubmit = document.getElementById('admin-password-submit');
const adminPasswordCancel = document.getElementById('admin-password-cancel');
const adminPasswordError = document.getElementById('admin-password-error');

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Supabase to initialize
  await waitForSupabase();
  console.log('Supabase initialized for web admin');

  // Check if already logged in
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
  if (isLoggedIn) {
    // Skip to admin panel
    homepage.classList.add('hidden');
    gameInterface.classList.remove('hidden');
    setTimeout(() => openAdminModal(), 100);
    return;
  }

  // Admin button handler
  adminHomeBtn.addEventListener('click', showAdminPasswordModal);

  // Admin password modal handlers
  adminPasswordSubmit.addEventListener('click', handleAdminPassword);
  adminPasswordCancel.addEventListener('click', hideAdminPasswordModal);
  adminPasswordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAdminPassword();
  });
});

// Show admin password modal
function showAdminPasswordModal() {
  homepage.classList.add('hidden');
  adminPasswordModal.classList.remove('hidden');
  adminPasswordModal.classList.add('flex');
  adminPasswordInput.focus();
  adminPasswordError.classList.add('hidden');
  adminPasswordInput.value = '';
}

// Hide admin password modal
function hideAdminPasswordModal() {
  adminPasswordModal.classList.add('hidden');
  adminPasswordModal.classList.remove('flex');
  homepage.classList.remove('hidden');
  adminPasswordError.classList.add('hidden');
}

// Handle admin password
async function handleAdminPassword() {
  const password = adminPasswordInput.value;

  if (!password) {
    adminPasswordError.textContent = 'Please enter password';
    adminPasswordError.classList.remove('hidden');
    return;
  }

  try {
    // Check if admin player exists with this password
    const { data, error } = await supabaseClient
      .from('players')
      .select('*')
      .eq('role', 'admin')
      .eq('password', password)
      .single();

    if (error || !data) {
      adminPasswordError.textContent = 'Invalid admin password';
      adminPasswordError.classList.remove('hidden');
      adminPasswordInput.value = '';
      adminPasswordInput.focus();
      return;
    }

    // Successful admin login - Set session
    sessionStorage.setItem('adminLoggedIn', 'true');
    sessionStorage.setItem('adminName', data.name);

    // Hide admin password modal
    adminPasswordModal.classList.add('hidden');
    adminPasswordModal.classList.remove('flex');
    adminPasswordError.classList.add('hidden');

    // Keep homepage hidden and show game interface (needed for modals)
    homepage.classList.add('hidden');
    gameInterface.classList.remove('hidden');

    // Open admin panel modal
    setTimeout(() => {
      openAdminModal();
    }, 300);
  } catch (err) {
    console.error('Admin login error:', err);
    adminPasswordError.textContent = 'Login failed. Please try again.';
    adminPasswordError.classList.remove('hidden');
  }
}

// Modal functions for admin panels
function openAdminModal() {
  const modal = document.getElementById('admin-panel-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Reload iframe to refresh admin panel
    const iframe = document.getElementById('admin-iframe');
    if (iframe) {
      iframe.src = iframe.src;
    }
  }
}

function closeAdminModal() {
  const modal = document.getElementById('admin-panel-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }

  // Logout and return to homepage
  sessionStorage.removeItem('adminLoggedIn');
  sessionStorage.removeItem('adminName');
  gameInterface.classList.add('hidden');
  homepage.classList.remove('hidden');
}

function openRewardSettingsModal() {
  const modal = document.getElementById('reward-settings-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeRewardSettingsModal() {
  const modal = document.getElementById('reward-settings-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openDailyBonusModal() {
  const modal = document.getElementById('daily-bonus-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeDailyBonusModal() {
  const modal = document.getElementById('daily-bonus-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openWinChancesModal() {
  const modal = document.getElementById('win-chances-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeWinChancesModal() {
  const modal = document.getElementById('win-chances-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openBudgetSettingsModal() {
  const modal = document.getElementById('budget-settings-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    const iframe = document.getElementById('budget-settings-iframe');
    if (iframe) iframe.src = iframe.src; // Reload
  }
}

function closeBudgetSettingsModal() {
  const modal = document.getElementById('budget-settings-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Make modal functions global for iframes to call
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.openRewardSettingsModal = openRewardSettingsModal;
window.closeRewardSettingsModal = closeRewardSettingsModal;
window.openDailyBonusModal = openDailyBonusModal;
window.closeDailyBonusModal = closeDailyBonusModal;
window.openWinChancesModal = openWinChancesModal;
window.closeWinChancesModal = closeWinChancesModal;
window.openBudgetSettingsModal = openBudgetSettingsModal;
window.closeBudgetSettingsModal = closeBudgetSettingsModal;
