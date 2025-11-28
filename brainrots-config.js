// Brainrot Configuration for 7x7 Grid
// 20 clickable boxes + 4 rampage boxes (non-clickable, at center of each edge)

// Rarity system (like Roblox Steal a Brainrot):
// Common (gray): x2-x3
// Uncommon (green): x4-x5
// Rare (blue): x6-x7
// Epic (purple): x8-x9
// Legendary (gold): x10+

const BRAINROTS_CONFIG = [
  // Top row (left to right): indices 0-6
  { name: 'Pipi Corni', multiplier: 2, image: 'assets/images/Pipi-Corni.png', rarity: 'common', isRampage: false },
  { name: 'Job Sahur', multiplier: 5, image: 'assets/images/Job-Job-Job-Sahur-1.webp', rarity: 'uncommon', isRampage: false },
  { name: 'Penguino', multiplier: 3, image: 'assets/images/Penguino-Cocosino-1-150x150.webp', rarity: 'common', isRampage: false },
  { name: '⚡ BONUS ⚡', multiplier: 0, image: 'assets/images/Vampira-Cappucina-Icon-300x300.webp', isRampage: true },  // Top center rampage
  { name: 'Los Tacoritas', multiplier: 8, image: 'assets/images/Los-Tacoritas-Icon.png', rarity: 'epic', isRampage: false },
  { name: 'Sigma Girl', multiplier: 10, image: 'assets/images/Sigma-Girl-Icon.png', rarity: 'legendary', isRampage: false },
  { name: 'Los Matteos', multiplier: 7, image: 'assets/images/Los-Matteos.webp', rarity: 'rare', isRampage: false },

  // Right column (top to bottom, excluding corners): indices 7-10
  { name: 'Rang Ring Bus', multiplier: 5, image: 'assets/images/Steal-A-Brainrot-Wiki-Rang-Ring-Bus-Icon.png', rarity: 'uncommon', isRampage: false },
  { name: 'Los Burritos', multiplier: 4, image: 'assets/images/Steal-a-Brainrot-Wiki-Brainrot-Los-Burritos-Icon-150x150.webp', rarity: 'uncommon', isRampage: false },
  { name: '⚡ BONUS ⚡', multiplier: 0, image: 'assets/images/Los-Mobilis-Icon-300x300.webp', isRampage: true },  // Right center rampage
  { name: 'Magi Ribbitini', multiplier: 9, image: 'assets/images/Magi-Ribbitini-Icon-300x300.webp', rarity: 'epic', isRampage: false },
  { name: 'Ti Ti Ti Sahur', multiplier: 3, image: 'assets/images/Ti-Ti-Ti-Sahur-1.png', rarity: 'common', isRampage: false },

  // Bottom row (right to left): indices 11-17
  { name: 'Burguro Fryuro', multiplier: 4, image: 'assets/images/Burguro-and-Fryuro-Icon-150x150.webp', rarity: 'uncommon', isRampage: false },
  { name: 'La Sahur', multiplier: 6, image: 'assets/images/La-Sahur-Combinasion-150x150.webp', rarity: 'rare', isRampage: false },
  { name: 'Ballerino Lololo', multiplier: 4, image: 'assets/images/Ballerino-Lololo-3.webp', rarity: 'uncommon', isRampage: false },
  { name: '⚡ BONUS ⚡', multiplier: 0, image: 'assets/images/Steal-a-Brainrot-Wiki-Skull-Skull-Skull-Icon-300x300.webp', isRampage: true },  // Bottom center rampage
  { name: 'Chef Crabracadabra', multiplier: 5, image: 'assets/images/Chef-Crabracadabra.webp', rarity: 'uncommon', isRampage: false },
  { name: 'Te Te Te Sahur', multiplier: 3, image: 'assets/images/Te-Te-Te-Sahur-1-150x150.webp', rarity: 'common', isRampage: false },
  { name: 'La Grande', multiplier: 6, image: 'assets/images/La-Grande-Combinasion-1.webp', rarity: 'rare', isRampage: false },

  // Left column (bottom to top, excluding corners): indices 18-21
  { name: 'Burrito Bandito', multiplier: 7, image: 'assets/images/Steal-a-Brainrot-Wiki-Burrito-Bandito-Icon-150x150.webp', rarity: 'rare', isRampage: false },
  { name: 'Pumpkini', multiplier: 8, image: 'assets/images/Steal-a-Brainrot-Wiki-Pumpkini-Spyderini-Icon-150x150.webp', rarity: 'epic', isRampage: false },
  { name: '⚡ BONUS ⚡', multiplier: 0, image: 'assets/images/Magi-Ribbitini-Icon-300x300.webp', isRampage: true },  // Left center rampage
  { name: 'Lirili Larila', multiplier: 9, image: 'assets/images/Lirili-Larila.webp', rarity: 'epic', isRampage: false },
  { name: 'Ballerina', multiplier: 2, image: 'assets/images/Ballerina-Cappuccina-1-150x150.webp', rarity: 'common', isRampage: false }
];

// Rarity color mapping (for multiplier badges)
const RARITY_COLORS = {
  common: '#9CA3AF',      // Gray
  uncommon: '#10B981',    // Green
  rare: '#3B82F6',        // Blue
  epic: '#A855F7',        // Purple
  legendary: '#F59E0B'    // Gold/Orange
};

// Grid position mapping for 7x7 grid (24 boxes completely filling perimeter)
// Position [row, col] for each index
// Rampage boxes are at the center of each edge (indices 3, 9, 15, 21)
const GRID_POSITIONS = [
  // Top row (indices 0-6): 7 boxes filling entire top
  [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  // Right column (indices 7-11): 5 boxes (excluding corners)
  [1, 6], [2, 6], [3, 6], [4, 6], [5, 6],
  // Bottom row (indices 12-18): 7 boxes filling entire bottom (right to left)
  [6, 6], [6, 5], [6, 4], [6, 3], [6, 2], [6, 1], [6, 0],
  // Left column (indices 19-23): 5 boxes (excluding corners, bottom to top)
  [5, 0], [4, 0], [3, 0], [2, 0], [1, 0]
];

// Light sequence (clockwise around perimeter)
// ONLY clickable boxes - excludes rampage boxes (indices 3, 9, 15, 21)
const LIGHT_SEQUENCE = [
  0, 1, 2, 4, 5, 6,        // Top row (skip index 3 - rampage)
  7, 8, 10, 11,            // Right column (skip index 9 - rampage)
  12, 13, 14, 16, 17, 18,  // Bottom row (skip index 15 - rampage)
  19, 20, 22, 23           // Left column (skip index 21 - rampage)
];

// Rampage box indices (for triggering chaos mode randomly during spin)
const RAMPAGE_INDICES = [3, 9, 15, 21];

// Roblox/Robux icon URLs
const ROBLOX_ICON = 'https://via.placeholder.com/200?text=ROBLOX';
const ROBUX_ICON = 'assets/bg-images/robux.png';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BRAINROTS_CONFIG, RARITY_COLORS, GRID_POSITIONS, LIGHT_SEQUENCE, ROBLOX_ICON, ROBUX_ICON, RAMPAGE_INDICES };
}
