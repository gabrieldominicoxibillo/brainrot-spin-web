// Daily Bonus Settings Manager
let supabaseClient = null;

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

// Load settings from database
async function loadSettings() {
  try {
    const { data, error } = await supabaseClient
      .from('daily_bonus_settings')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading settings:', error);
      return;
    }

    if (data) {
      document.getElementById('register-bonus').value = data.register_bonus || 10;
      document.getElementById('daily-claim-1-6').value = data.daily_claim_1_6 || 2;
      document.getElementById('daily-claim-7').value = data.daily_claim_7 || 3;
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
}

// Save settings to database
async function saveSettings() {
  console.log('=== SAVE SETTINGS CLICKED ===');

  const saveMessage = document.getElementById('save-message');
  const errorMessage = document.getElementById('error-message');

  saveMessage.classList.add('hidden');
  errorMessage.classList.add('hidden');

  const settings = {
    register_bonus: parseInt(document.getElementById('register-bonus').value),
    daily_claim_1_6: parseInt(document.getElementById('daily-claim-1-6').value),
    daily_claim_7: parseInt(document.getElementById('daily-claim-7').value)
  };

  console.log('Settings to save:', settings);

  try {
    // Check if settings exist
    console.log('Checking for existing settings...');
    const { data: existing, error: selectError } = await supabaseClient
      .from('daily_bonus_settings')
      .select('id')
      .single();

    console.log('Existing data:', existing);
    console.log('Select error:', selectError);

    let result;
    if (existing) {
      // Update existing
      console.log('Updating existing row with id:', existing.id);
      result = await supabaseClient
        .from('daily_bonus_settings')
        .update(settings)
        .eq('id', existing.id);

      console.log('Update result:', result);
    } else {
      // Insert new
      console.log('Inserting new row');
      result = await supabaseClient
        .from('daily_bonus_settings')
        .insert([settings]);

      console.log('Insert result:', result);
    }

    if (result.error) {
      console.error('Error saving settings:', result.error);
      errorMessage.textContent = `Error: ${result.error.message}`;
      errorMessage.classList.remove('hidden');
      return;
    }

    console.log('Save successful!');
    saveMessage.classList.remove('hidden');
    setTimeout(() => {
      saveMessage.classList.add('hidden');
    }, 3000);

  } catch (err) {
    console.error('Error saving settings (caught):', err);
    errorMessage.textContent = `Error: ${err.message}`;
    errorMessage.classList.remove('hidden');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOMContentLoaded - Starting initialization');

  await waitForSupabase();
  console.log('Supabase initialized');

  await loadSettings();
  console.log('Settings loaded');

  const saveBtn = document.getElementById('save-btn');
  console.log('Save button found:', saveBtn);

  if (saveBtn) {
    saveBtn.addEventListener('click', saveSettings);
    console.log('Event listener attached to save button');
  } else {
    console.error('Save button not found!');
  }
});
