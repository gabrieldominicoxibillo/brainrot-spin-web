// Supabase client
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

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await waitForSupabase();
  loadSettings();
});

// Load current settings from database
async function loadSettings() {
  try {
    const { data, error } = await supabaseClient
      .from('reward_settings')
      .select('*')
      .single();

    if (error) {
      console.log('No existing settings found, using defaults');
      return;
    }

    // Populate form with existing values
    if (data) {
      // Bet milestones
      document.getElementById('milestone-20').value = data.milestone_20 || 3;
      document.getElementById('milestone-50').value = data.milestone_50 || 8;
      document.getElementById('milestone-100').value = data.milestone_100 || 20;
      document.getElementById('milestone-250').value = data.milestone_250 || 50;
      document.getElementById('milestone-500').value = data.milestone_500 || 120;
      document.getElementById('milestone-1000').value = data.milestone_1000 || 300;

      // Daily attendance
      document.getElementById('daily-login').value = data.daily_login || 1;
      document.getElementById('streak-7').value = data.streak_7 || 5;
      document.getElementById('streak-14').value = data.streak_14 || 10;
      document.getElementById('streak-30').value = data.streak_30 || 20;

      // Monthly achievements
      document.getElementById('monthly-active').value = data.monthly_active || 15;
      document.getElementById('monthly-dedicated').value = data.monthly_dedicated || 40;
      document.getElementById('monthly-super').value = data.monthly_super || 100;
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
}

// Save settings to database
async function saveSettings() {
  try {
    const settings = {
      // Bet milestones
      milestone_20: parseInt(document.getElementById('milestone-20').value) || 3,
      milestone_50: parseInt(document.getElementById('milestone-50').value) || 8,
      milestone_100: parseInt(document.getElementById('milestone-100').value) || 20,
      milestone_250: parseInt(document.getElementById('milestone-250').value) || 50,
      milestone_500: parseInt(document.getElementById('milestone-500').value) || 120,
      milestone_1000: parseInt(document.getElementById('milestone-1000').value) || 300,

      // Daily attendance
      daily_login: parseInt(document.getElementById('daily-login').value) || 1,
      streak_7: parseInt(document.getElementById('streak-7').value) || 5,
      streak_14: parseInt(document.getElementById('streak-14').value) || 10,
      streak_30: parseInt(document.getElementById('streak-30').value) || 20,

      // Monthly achievements
      monthly_active: parseInt(document.getElementById('monthly-active').value) || 15,
      monthly_dedicated: parseInt(document.getElementById('monthly-dedicated').value) || 40,
      monthly_super: parseInt(document.getElementById('monthly-super').value) || 100,

      updated_at: new Date().toISOString()
    };

    // Try to update existing record first
    const { data: existing } = await supabaseClient
      .from('reward_settings')
      .select('id')
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabaseClient
        .from('reward_settings')
        .update(settings)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabaseClient
        .from('reward_settings')
        .insert([settings]);

      if (error) throw error;
    }

    alert('✅ Reward settings saved successfully!');
  } catch (err) {
    console.error('Error saving settings:', err);
    alert('❌ Failed to save settings: ' + err.message);
  }
}
