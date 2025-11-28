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
  populateBrainrotWeights();
  loadSettings();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const weightedSection = document.getElementById('weighted-section');
      if (e.target.value === 'weighted') {
        weightedSection.classList.remove('hidden');
      } else {
        weightedSection.classList.add('hidden');
      }
    });
  });

  // Update total weight on input change
  document.getElementById('brainrot-weights').addEventListener('input', updateTotalWeight);
}

// Populate brainrot weights inputs
function populateBrainrotWeights() {
  const container = document.getElementById('brainrot-weights');
  const clickableBrainrots = BRAINROTS_CONFIG.filter(b => !b.isRampage);

  clickableBrainrots.forEach((brainrot, index) => {
    const div = document.createElement('div');
    div.className = 'bg-white bg-opacity-10 p-3 rounded-lg';
    div.innerHTML = `
      <p class="text-white text-sm font-bold mb-1">${brainrot.name}</p>
      <p class="text-gray-300 text-xs mb-2">x${brainrot.multiplier}</p>
      <input type="number"
             id="weight-${index}"
             value="5"
             min="0"
             max="100"
             step="0.1"
             class="w-full bg-white bg-opacity-20 text-white px-2 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
      <p class="text-gray-400 text-xs mt-1">Weight %</p>
    `;
    container.appendChild(div);
  });
}

// Update total weight display
function updateTotalWeight() {
  const clickableBrainrots = BRAINROTS_CONFIG.filter(b => !b.isRampage);
  let total = 0;

  clickableBrainrots.forEach((_, index) => {
    const input = document.getElementById(`weight-${index}`);
    total += parseFloat(input.value) || 0;
  });

  const totalDisplay = document.getElementById('total-weight');
  totalDisplay.textContent = total.toFixed(1);

  if (Math.abs(total - 100) < 0.1) {
    totalDisplay.className = 'text-green-400 font-bold';
  } else {
    totalDisplay.className = 'text-red-400 font-bold';
  }
}

// Load current settings from database
async function loadSettings() {
  try {
    const { data, error } = await supabaseClient
      .from('win_chances_settings')
      .select('*')
      .single();

    if (error) {
      console.log('No existing settings found, using defaults');
      return;
    }

    if (data) {
      // Set mode
      document.getElementById(`mode-${data.mode}`).checked = true;
      if (data.mode === 'weighted') {
        document.getElementById('weighted-section').classList.remove('hidden');
      }

      // Set rampage chance
      document.getElementById('rampage-chance').value = data.rampage_chance || 20;

      // Set weights if weighted mode
      if (data.mode === 'weighted' && data.weights) {
        const weights = data.weights;
        Object.keys(weights).forEach(key => {
          const input = document.getElementById(`weight-${key}`);
          if (input) {
            input.value = weights[key];
          }
        });
        updateTotalWeight();
      }
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }
}

// Save settings to database
async function saveSettings() {
  try {
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const clickableBrainrots = BRAINROTS_CONFIG.filter(b => !b.isRampage);

    // Collect weights
    const weights = {};
    if (mode === 'weighted') {
      let total = 0;
      clickableBrainrots.forEach((_, index) => {
        const input = document.getElementById(`weight-${index}`);
        const weight = parseFloat(input.value) || 0;
        weights[index] = weight;
        total += weight;
      });

      // Validate total is 100%
      if (Math.abs(total - 100) > 0.1) {
        alert('❌ Total weight must equal 100%! Current total: ' + total.toFixed(1) + '%');
        return;
      }
    } else {
      // Equal mode - each box gets equal weight
      const equalWeight = 100 / clickableBrainrots.length;
      clickableBrainrots.forEach((_, index) => {
        weights[index] = equalWeight;
      });
    }

    const settings = {
      mode,
      weights,
      rampage_chance: parseInt(document.getElementById('rampage-chance').value) || 20,
      updated_at: new Date().toISOString()
    };

    // Try to update existing record first
    const { data: existing } = await supabaseClient
      .from('win_chances_settings')
      .select('id')
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabaseClient
        .from('win_chances_settings')
        .update(settings)
        .eq('id', existing.id);

      if (error) throw error;
    } else {
      // Insert new
      const { error } = await supabaseClient
        .from('win_chances_settings')
        .insert([settings]);

      if (error) throw error;
    }

    alert('✅ Win chances settings saved successfully!');
  } catch (err) {
    console.error('Error saving settings:', err);
    alert('❌ Failed to save settings: ' + err.message);
  }
}
