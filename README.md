# Brainrot Spin - Web Admin Panel

Web version of the Brainrot Spin admin panel. Uses the **same Supabase database** as the Electron desktop version.

## Quick Start

1. **Open admin-web.html** in your browser (or use a local server)
2. **Login** with password: `admin123`
3. **Done!** You can now manage players and settings

## Features

- ✅ Admin password authentication with session management
- ✅ Player management (add, edit, delete)
- ✅ Robux management (add/deduct)
- ✅ Game assignment
- ✅ Budget tracking & stats
- ✅ Settings panels:
  - Reward Settings
  - Win Chances Settings
  - Daily Bonus Settings
  - Budget Settings
- ✅ Secure session - auto-redirect to login if not authenticated
- ✅ Auto-refresh data every 3 seconds

## Tech Stack

- **Frontend Only**: Pure HTML, CSS (Tailwind), JavaScript
- **Database**: Supabase (shared with Electron version)
- **No Backend Needed**: Direct Supabase client
- **Session Management**: SessionStorage for login state

## Setup

### Option 1: Direct Open (Simplest)
Just double-click **`admin-web.html`** in Windows Explorer!

### Option 2: Local Server (Recommended)
```bash
cd brainrot-spin-web

# Python
python -m http.server 8000

# PHP
php -S localhost:8000

# Node.js
npx serve
```

Then visit: `http://localhost:8000/admin-web.html`

### Default Login

**Password:** `admin123`

(This checks the `players` table in Supabase for a record with `role='admin'` and matching `password`)

## Deployment to Cloudflare Pages

### Method 1: GitHub Deploy (Recommended)
1. Push code to GitHub repository
2. Go to [Cloudflare Pages](https://pages.cloudflare.com)
3. Connect your repository
4. Build settings:
   - **Build command**: (leave empty)
   - **Build output directory**: `/`
   - **Root directory**: `brainrot-spin-web`
5. Deploy!

Your admin panel will be live at: `https://your-project.pages.dev`

### Method 2: Direct Upload
1. Go to Cloudflare Pages
2. Create new project
3. Upload all `.html` and `.js` files
4. Deploy!

### Method 3: Wrangler CLI
```bash
# Install Wrangler (if not already installed)
npm install -g wrangler

# Login
wrangler login

# Publish
wrangler pages publish . --project-name=brainrot-spin-admin
```

## File Structure

```
brainrot-spin-web/
├── admin-web.html           # ⭐ MAIN LOGIN PAGE (start here!)
├── auth-web-fixed.js        # Authentication with session
├── session-check.js         # Session validator
├── admin.html               # Admin panel page
├── admin-fixed.js           # Admin panel logic
├── reward-settings.html
├── reward-settings.js
├── win-chances-settings.html
├── win-chances-settings.js
├── daily-bonus-settings.html
├── daily-bonus-settings.js
├── budget-settings.html
├── budget-settings.js
└── README.md
```

## How It Works

### Login Flow
1. User opens `admin-web.html`
2. Enters admin password
3. System checks Supabase `players` table for `role='admin'` and matching password
4. On success: Sets `sessionStorage.adminLoggedIn = true`
5. Shows admin panel

### Session Security
- All admin pages check for `sessionStorage.adminLoggedIn`
- If not logged in → auto-redirect to `admin-web.html`
- Session persists until browser tab closes or logout

### Modal System
- All settings open in modals (overlay popups)
- Settings buttons in admin panel trigger parent window modal functions
- "Back" button logs out and returns to login

## Database (Supabase)

### Shared Database with Electron Version

This web version uses the **exact same Supabase database** as the Electron desktop app.

**Connection:**
- URL: `https://sjxxwyucnkmsmeumging.supabase.co`
- Anon Key: (embedded in code)

### Tables:
- `players` - Player data and admin accounts
- `game_history` - Game spin records
- `transactions` - Robux transactions
- `reward_settings` - Reward configuration
- `win_chances_settings` - Win probability settings
- `daily_bonus_settings` - Daily bonus configuration
- `game_budget` - Budget management
- `daily_claims` - Daily claim tracking

## Create Admin Account (if needed)

If you don't have an admin account in Supabase yet:

1. Go to your Supabase project
2. Table Editor → `players`
3. Insert new row:
   ```
   name: Admin
   role: admin
   password: admin123
   robux: 0
   color: #FFD700
   assigned_to_game: false
   ```

## Troubleshooting

### Can't Login
- Check Supabase `players` table has admin with correct password
- Verify Supabase connection in browser console
- Check for any errors in browser console (F12)

### Buttons Not Working
- Make sure you're on `admin-web.html` (not `admin.html` directly)
- Check browser console for JavaScript errors
- Verify all `.js` files are loaded correctly

### Data Not Loading
- Open browser console (F12)
- Check for Supabase connection errors
- Verify Supabase URL and key in code
- Check network tab for failed requests

### Session Lost
- Sessions are stored in `sessionStorage` (clears on tab close)
- Use `localStorage` if you want persistent sessions
- Just login again if session expires

## Differences from Electron Version

| Feature | Electron | Web |
|---------|----------|-----|
| Platform | Desktop app | Browser |
| Database | Supabase | Supabase (same!) |
| UI | admin-web.html | Copied exactly |
| Access | Local only | Anywhere (when deployed) |
| Installation | Required | None needed |
| Session | N/A | SessionStorage |

## Security Notes

⚠️ **For Production:**
- Change admin password from default `admin123`
- Use proper authentication (not plain text passwords)
- Enable proper Supabase RLS policies
- Use environment variables for sensitive data
- Add rate limiting to prevent brute force

## Development

### Test Locally
```bash
# Start server
cd brainrot-spin-web
python -m http.server 8000

# Open in browser
http://localhost:8000/admin-web.html
```

### Make Changes
1. Edit HTML/JS files
2. Refresh browser (Ctrl+F5 for hard refresh)
3. Test functionality
4. Push to GitHub
5. Cloudflare auto-deploys

## License

MIT
