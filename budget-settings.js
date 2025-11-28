// Budget Settings Manager
let supabaseClient = null;
const FIXED_BUDGET_ID = '00000000-0000-0000-0000-000000000001';

// Wait for Supabase to be ready
async function waitForSupabase() {
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

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Budget settings loading...');
  await waitForSupabase();
  console.log('Supabase initialized');

  await loadSettings();
  updateDisplays();
});

// Load settings from database
async function loadSettings() {
  try {
    const { data, error } = await supabaseClient
      .from('game_budget')
      .select('*')
      .eq('id', FIXED_BUDGET_ID)
      .single();

    if (error) {
      console.error('Error loading budget settings:', error);
      // Use defaults if no data exists
      return;
    }

    if (data) {
      document.getElementById('current-budget').value = data.current_budget ?? 1000;
      document.getElementById('max-win-percentage').value = data.max_win_percentage ?? 75;
      document.getElementById('loss-comp-per-loss').value = data.loss_compensation_per_loss ?? 5;
      document.getElementById('max-loss-comp').value = data.max_loss_compensation ?? 50;

      updateDisplays();
      console.log('Budget settings loaded:', data);
    }
  } catch (err) {
    console.error('Error loading budget settings:', err);
  }
}

// Update all displays
function updateDisplays() {
  updateMaxWinDisplay();
  updateLossCompDisplay();
  updateMaxLossCompDisplay();
  updateBudgetOverview();
}

// Update max win percentage display
function updateMaxWinDisplay() {
  const value = document.getElementById('max-win-percentage').value;
  document.getElementById('max-win-display').textContent = value + '%';
  updateBudgetOverview();
}

// Update loss compensation display
function updateLossCompDisplay() {
  const value = document.getElementById('loss-comp-per-loss').value;
  document.getElementById('loss-comp-display').textContent = value + '%';
}

// Update max loss compensation display
function updateMaxLossCompDisplay() {
  const value = document.getElementById('max-loss-comp').value;
  document.getElementById('max-loss-comp-display').textContent = value + '%';
}

// Update budget overview displays
function updateBudgetOverview() {
  const budget = parseInt(document.getElementById('current-budget').value) || 0;
  const maxWinPercent = parseInt(document.getElementById('max-win-percentage').value) || 75;
  const maxWin = Math.floor(budget * (maxWinPercent / 100));

  document.getElementById('display-budget').textContent = budget.toLocaleString();
  document.getElementById('display-max-win').textContent = maxWin.toLocaleString();

  // Update status
  const statusCard = document.getElementById('status-card');
  const statusText = document.getElementById('display-status');

  statusCard.className = 'stat-display rounded-lg p-4';

  if (budget === 0) {
    statusCard.classList.add('danger');
    statusText.textContent = 'EMPTY';
    statusText.className = 'text-2xl font-bold text-red-400';
  } else if (budget < 100) {
    statusCard.classList.add('warning');
    statusText.textContent = 'Low';
    statusText.className = 'text-2xl font-bold text-yellow-400';
  } else if (budget < 500) {
    statusCard.classList.add('warning');
    statusText.textContent = 'Fair';
    statusText.className = 'text-2xl font-bold text-yellow-400';
  } else {
    statusText.textContent = 'Healthy';
    statusText.className = 'text-2xl font-bold text-green-400';
  }
}

// Save settings to database
async function saveSettings() {
  const saveMessage = document.getElementById('save-message');
  const errorMessage = document.getElementById('error-message');

  saveMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');

  const settings = {
    current_budget: parseInt(document.getElementById('current-budget').value ?? 1000),
    max_win_percentage: parseInt(document.getElementById('max-win-percentage').value ?? 75),
    loss_compensation_per_loss: parseInt(document.getElementById('loss-comp-per-loss').value ?? 5),
    max_loss_compensation: parseInt(document.getElementById('max-loss-comp').value ?? 50)
  };

  console.log('Saving budget settings:', settings);

  try {
    // Check if row exists
    const { data: existing, error: checkError } = await supabaseClient
      .from('game_budget')
      .select('id')
      .eq('id', FIXED_BUDGET_ID)
      .single();

    let result;
    if (existing) {
      // Update existing
      result = await supabaseClient
        .from('game_budget')
        .update(settings)
        .eq('id', FIXED_BUDGET_ID)
        .select();
    } else {
      // Insert new with fixed ID
      result = await supabaseClient
        .from('game_budget')
        .insert([{
          id: FIXED_BUDGET_ID,
          ...settings
        }])
        .select();
    }

    if (result.error) {
      console.error('Error saving budget settings:', result.error);
      errorMessage.textContent = `Error: ${result.error.message}`;
      errorMessage.classList.remove('hidden');
      return;
    }

    console.log('Budget settings saved successfully');
    saveMessage.classList.remove('hidden');
    setTimeout(() => {
      saveMessage.classList.add('hidden');
    }, 3000);

  } catch (err) {
    console.error('Error saving budget settings:', err);
    errorMessage.textContent = `Error: ${err.message}`;
    errorMessage.classList.remove('hidden');
  }
}

// Reset to default values
function resetToDefaults() {
  if (!confirm('Reset all settings to defaults?')) {
    return;
  }

  document.getElementById('current-budget').value = 1000;
  document.getElementById('max-win-percentage').value = 75;
  document.getElementById('loss-comp-per-loss').value = 5;
  document.getElementById('max-loss-comp').value = 50;

  updateDisplays();
}

// Update budget overview when budget input changes
document.addEventListener('DOMContentLoaded', () => {
  const budgetInput = document.getElementById('current-budget');
  if (budgetInput) {
    budgetInput.addEventListener('input', updateBudgetOverview);
  }
});
