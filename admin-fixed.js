// Admin panel with session check and fixed modal functions
// Session check
if (!sessionStorage.getItem('adminLoggedIn')) {
  window.location.href = 'admin-web.html';
}

// Supabase client (use global window.supabase from CDN)
let supabase = null;

// Initialize Supabase
function initSupabase() {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (window.supabase && window.supabase.createClient) {
        clearInterval(checkInterval);
        const SUPABASE_URL = 'https://sjxxwyucnkmsmeumging.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqeHh3eXVjbmttc21ldW1naW5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMzkwODYsImV4cCI6MjA3OTcxNTA4Nn0.CHV-72F5mDU_W-rVcdFhsW2VsuRXNUFac-ovchreKDQ';
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        resolve();
      }
    }, 100);
  });
}

// Available colors pool
const AVAILABLE_COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#14b8a6', // teal
  '#a855f7', // purple
  '#f43f5e', // rose
  '#06b6d4', // sky
  '#eab308', // yellow
  '#22c55e', // emerald
  '#6366f1', // indigo
];

// State
let selectedPlayerId = null;
let players = [];
let gameFunding = null;

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Admin panel loading...');
  await initSupabase();
  console.log('Supabase initialized in admin panel');

  loadGameFunding();
  loadPlayers();

  // Refresh data every 3 seconds
  setInterval(() => {
    loadGameFunding();
    loadPlayers();
  }, 3000);
});

// Get next available color
function getNextAvailableColor() {
  const usedColors = players.map(p => p.color);
  const availableColors = AVAILABLE_COLORS.filter(color => !usedColors.includes(color));

  if (availableColors.length === 0) {
    // If all colors are used, generate a random color
    return `#${Math.floor(Math.random()*16777215).toString(16)}`;
  }

  return availableColors[0];
}

// Load budget stats
async function loadGameFunding() {
  try {
    // Load current budget
    const { data: budgetData, error: budgetError } = await supabase
      .from('game_budget')
      .select('current_budget')
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .single();

    if (budgetError) throw budgetError;

    const currentBudget = budgetData?.current_budget ?? 0;

    // Calculate total player losses from game history
    const { data: lossData, error: lossError } = await supabase
      .from('game_history')
      .select('bet_amount')
      .eq('is_win', false);

    const totalLosses = lossData ? lossData.reduce((sum, record) => sum + record.bet_amount, 0) : 0;

    // Calculate total accumulated
    const totalAccumulated = currentBudget + totalLosses;

    // Calculate total player robux
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('robux');

    const totalPlayerRobux = playersData ? playersData.reduce((sum, p) => sum + p.robux, 0) : 0;

    // Update display
    updateBudgetDisplay(currentBudget, totalLosses, totalAccumulated, totalPlayerRobux);
  } catch (error) {
    console.error('Error loading budget stats:', error);
  }
}

// Update budget display
function updateBudgetDisplay(currentBudget, totalLosses, totalAccumulated, totalPlayerRobux) {
  document.getElementById('current-budget').textContent = currentBudget.toLocaleString();
  document.getElementById('total-losses').textContent = totalLosses.toLocaleString();
  document.getElementById('total-accumulated').textContent = totalAccumulated.toLocaleString();
  document.getElementById('total-player-robux').textContent = totalPlayerRobux.toLocaleString();
}

// Add player
async function addPlayer() {
  const name = document.getElementById('player-name').value.trim();
  const initialRobux = parseInt(document.getElementById('initial-robux').value) || 1000;

  if (!name) {
    alert('Please enter a player name');
    return;
  }

  // Auto-assign color
  const color = getNextAvailableColor();

  try {
    const { data, error } = await supabase
      .from('players')
      .insert([
        { name, robux: initialRobux, color }
      ])
      .select();

    if (error) throw error;

    // Add transaction record
    await supabase.from('transactions').insert([{
      player_id: data[0].id,
      player_name: name,
      amount: initialRobux,
      transaction_type: 'add',
      description: 'Initial robux'
    }]);

    document.getElementById('player-name').value = '';
    document.getElementById('initial-robux').value = '';
    loadPlayers();
    alert(`Player "${name}" added successfully with color ${color}!`);
  } catch (error) {
    console.error('Error adding player:', error);
    if (error.code === '23505') {
      alert('Player name already exists');
    } else {
      alert('Failed to add player');
    }
  }
}

// Load players
async function loadPlayers() {
  try {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    players = data;
    displayPlayers();
  } catch (error) {
    console.error('Error loading players:', error);
  }
}

// Display players
function displayPlayers() {
  const playersList = document.getElementById('players-list');
  const assignedCount = players.filter(p => p.assigned_to_game).length;
  document.getElementById('assigned-count').textContent = assignedCount;

  if (players.length === 0) {
    playersList.innerHTML = '<p class="text-gray-400 text-center col-span-full py-6 md:py-8 text-sm md:text-base">No players yet. Add your first player above!</p>';
    return;
  }

  playersList.innerHTML = players.map(player => `
    <div class="player-card bg-gray-700 rounded-xl p-3 md:p-4 border-2 ${selectedPlayerId === player.id ? 'selected' : ''}" style="border-color: ${player.color};" onclick="selectPlayer('${player.id}')">
      <div class="flex items-center justify-between mb-2 md:mb-3">
        <div class="flex items-center gap-2 md:gap-3">
          <div class="w-3 h-3 md:w-4 md:h-4 rounded-full" style="background: ${player.color};"></div>
          <h3 class="text-base md:text-xl font-bold text-white truncate">${player.name}</h3>
          ${player.assigned_to_game ? '<span class="text-green-400 text-xs hidden sm:inline">✓ In Game</span>' : ''}
        </div>
        <button onclick="deletePlayer(event, '${player.id}', '${player.name}')" class="text-red-400 hover:text-red-300 text-xs md:text-sm whitespace-nowrap">
          Delete
        </button>
      </div>

      <div class="space-y-1 md:space-y-2 mb-2 md:mb-3">
        <div class="flex justify-between">
          <span class="text-gray-400 text-xs md:text-sm">Robux:</span>
          <span class="text-yellow-400 font-bold text-xs md:text-base">${player.robux}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400 text-xs md:text-sm">Total Bets:</span>
          <span class="text-gray-300 text-xs md:text-base">${player.total_bets}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-400 text-xs md:text-sm">W/L:</span>
          <span class="text-gray-300 text-xs md:text-base">${player.total_wins}/${player.total_losses}</span>
        </div>
      </div>

      <button
        onclick="toggleGameAssignment(event, '${player.id}', ${player.assigned_to_game})"
        class="w-full py-1.5 md:py-2 rounded-lg font-bold text-xs md:text-sm transition-all ${player.assigned_to_game ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}"
      >
        ${player.assigned_to_game ? 'Remove' : 'Assign'}
      </button>
    </div>
  `).join('');
}

// Select player
function selectPlayer(playerId) {
  selectedPlayerId = playerId;
  const player = players.find(p => p.id === playerId);

  if (!player) return;

  displayPlayers();

  // Show selected player info
  document.getElementById('selected-player-info').classList.remove('hidden');
  document.getElementById('selected-player-name').textContent = player.name;
  document.getElementById('selected-player-robux').textContent = `${player.robux} Robux`;

  // Show robux management controls
  document.getElementById('robux-management').innerHTML = `
    <input type="number" id="robux-amount" placeholder="Enter amount" class="w-full bg-gray-700 text-white px-4 py-2 md:py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm md:text-base">

    <button onclick="addRobux()" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 md:py-3 rounded-lg transition-all text-sm md:text-base">
      Add Robux
    </button>

    <button onclick="deductRobux()" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 md:py-3 rounded-lg transition-all text-sm md:text-base">
      Deduct Robux
    </button>
  `;
}

// Add robux
async function addRobux() {
  const amount = parseInt(document.getElementById('robux-amount').value);

  if (!amount || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  if (!selectedPlayerId) {
    alert('Please select a player');
    return;
  }

  try {
    const player = players.find(p => p.id === selectedPlayerId);
    const newRobux = player.robux + amount;

    const { error } = await supabase
      .from('players')
      .update({ robux: newRobux })
      .eq('id', selectedPlayerId);

    if (error) throw error;

    // Add transaction record
    await supabase.from('transactions').insert([{
      player_id: selectedPlayerId,
      player_name: player.name,
      amount: amount,
      transaction_type: 'add',
      description: 'Admin added robux'
    }]);

    document.getElementById('robux-amount').value = '';
    loadPlayers();
    loadGameFunding(); // Refresh funding stats
    alert(`Successfully added ${amount} robux to ${player.name}!`);
  } catch (error) {
    console.error('Error adding robux:', error);
    alert('Failed to add robux');
  }
}

// Deduct robux
async function deductRobux() {
  const amount = parseInt(document.getElementById('robux-amount').value);

  if (!amount || amount <= 0) {
    alert('Please enter a valid amount');
    return;
  }

  if (!selectedPlayerId) {
    alert('Please select a player');
    return;
  }

  try {
    const player = players.find(p => p.id === selectedPlayerId);

    if (amount > player.robux) {
      alert('Cannot deduct more than player has');
      return;
    }

    const newRobux = player.robux - amount;

    const { error } = await supabase
      .from('players')
      .update({ robux: newRobux })
      .eq('id', selectedPlayerId);

    if (error) throw error;

    // Add transaction record
    await supabase.from('transactions').insert([{
      player_id: selectedPlayerId,
      player_name: player.name,
      amount: -amount,
      transaction_type: 'deduct',
      description: 'Admin deducted robux'
    }]);

    document.getElementById('robux-amount').value = '';
    loadPlayers();
    loadGameFunding(); // Refresh funding stats
    alert(`Successfully deducted ${amount} robux from ${player.name}!`);
  } catch (error) {
    console.error('Error deducting robux:', error);
    alert('Failed to deduct robux');
  }
}

// Delete player
async function deletePlayer(event, playerId, playerName) {
  event.stopPropagation();

  const confirm = window.confirm(`Are you sure you want to delete player "${playerName}"? This action cannot be undone.`);

  if (!confirm) return;

  try {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) throw error;

    if (selectedPlayerId === playerId) {
      selectedPlayerId = null;
      document.getElementById('selected-player-info').classList.add('hidden');
      document.getElementById('robux-management').innerHTML = '<p class="text-gray-400 text-center py-8">Select a player below to manage their robux</p>';
    }

    loadPlayers();
    loadGameFunding(); // Refresh funding stats
    alert(`Player "${playerName}" deleted successfully`);
  } catch (error) {
    console.error('Error deleting player:', error);
    alert('Failed to delete player');
  }
}

// Toggle game assignment
async function toggleGameAssignment(event, playerId, currentlyAssigned) {
  event.stopPropagation();

  try {
    const { error } = await supabase
      .from('players')
      .update({ assigned_to_game: !currentlyAssigned })
      .eq('id', playerId);

    if (error) throw error;

    loadPlayers();
    const action = currentlyAssigned ? 'removed from' : 'assigned to';
    const player = players.find(p => p.id === playerId);
    alert(`${player.name} ${action} game!`);
  } catch (error) {
    console.error('Error toggling game assignment:', error);
    alert('Failed to update game assignment');
  }
}

// Close admin panel - call parent window function
function closeAdmin() {
  if (window.parent && window.parent.closeAdminModal) {
    window.parent.closeAdminModal();
  } else {
    // Fallback: logout and redirect
    sessionStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-web.html';
  }
}

// Open settings windows - call parent window functions
function openRewardSettings() {
  if (window.parent && window.parent.openRewardSettingsModal) {
    window.parent.openRewardSettingsModal();
  }
}

function openWinChancesSettings() {
  if (window.parent && window.parent.openWinChancesModal) {
    window.parent.openWinChancesModal();
  }
}

function openDailyBonusSettings() {
  if (window.parent && window.parent.openDailyBonusModal) {
    window.parent.openDailyBonusModal();
  }
}

function openBudgetSettings() {
  if (window.parent && window.parent.openBudgetSettingsModal) {
    window.parent.openBudgetSettingsModal();
  }
}

// Reset budget to specific value
async function resetBudget() {
  const newBudget = parseInt(document.getElementById('reset-budget-value').value) || 1000;

  if (!confirm(`Reset current budget to ${newBudget} robux?`)) {
    return;
  }

  try {
    const { error } = await supabase
      .from('game_budget')
      .update({ current_budget: newBudget })
      .eq('id', '00000000-0000-0000-0000-000000000001');

    if (error) throw error;

    alert(`Budget reset to ${newBudget} robux!`);
    loadGameFunding(); // Reload stats
  } catch (err) {
    console.error('Error resetting budget:', err);
    alert('Failed to reset budget: ' + err.message);
  }
}

// Clear game history (resets total player losses)
async function clearGameHistory() {
  if (!confirm('⚠️ Clear ALL game history? This will reset total player losses to 0. This action cannot be undone!')) {
    return;
  }

  if (!confirm('Are you ABSOLUTELY sure? This will delete all game history records!')) {
    return;
  }

  try {
    const { error } = await supabase
      .from('game_history')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

    if (error) throw error;

    alert('Game history cleared! Total player losses reset to 0.');
    loadGameFunding(); // Reload stats
  } catch (err) {
    console.error('Error clearing game history:', err);
    alert('Failed to clear game history: ' + err.message);
  }
}
