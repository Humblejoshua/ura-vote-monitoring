# URA Vote Monitoring System

A static, zero-cost budget monitoring application for the Uganda Revenue Authority (URA), built for hosting on **GitHub Pages** with **Firebase Realtime Database** for live multi-user sync.

## Features

- **Dashboard** — KPI cards, budget-vs-spent charts, category breakdown, doughnut distribution, top spending votes
- **Vote Monitoring** — All 98 budget votes with GOU-Vote and internal Vote codes displayed side by side, search/filter, utilization progress bars, status indicators
- **Payment Entry** — Record payments against any vote, automatic balance deduction, overspend warnings
- **Reports** — Vote summary and payment transaction reports with PDF, CSV, and print export
- **Activity Log** — Track all recorded payments
- **Live Firebase Sync** — All users see payment updates instantly across every device

## Data Source

Budget data is pre-loaded from `votes.xlsx` — the URA Departmental Budget FY 2025/26, containing:

| Category | Code | Description |
|----------|------|-------------|
| A | Staff Costs | Salaries, allowances, social security |
| B | Transport Cost | Travel, fuel, vehicle maintenance |
| C | Maintenance Costs | Buildings, equipment, generators |
| D | Other Charges | Utilities, printing, training, welfare |
| E | Board Expenses | Retainer fees, sitting allowances |
| E | Capital Expenditure | Buildings, ICT equipment, vehicles |

**Total Budget: UGX 16,431,194,802**

## Quick Start (GitHub Pages)

1. Create a new GitHub repository
2. Push all files from this directory (except `votes.xlsx` and `ura logo.png` root copy)
3. Go to **Settings → Pages → Deploy from branch → main**
4. Your app will be live at `https://yourusername.github.io/repo-name/`

## Firebase Setup (Recommended)

For live sync so all 3 users see the same payment data:

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Add a **Web App** (Project Settings → General → Add app → Web) and copy its config
3. Build → **Realtime Database** → Create Database → choose a location → Start
4. **Authentication** → Sign-in method → enable **Anonymous**
5. Realtime Database → **Rules** → paste:
   ```json
   { "rules": { "payments": { ".read": "auth != null", ".write": "auth != null" } } }
   ```
6. Open the app → **Firebase Sync** → enter **Project ID**, **API Key**, **Database URL** → **Test Connection** → **Save Config**
7. Do this once on each of the 3 devices (settings are stored per-browser in localStorage)

> Until Firebase is connected, payments are stored in localStorage only (browser-specific).

## File Structure

```
├── index.html              # Main SPA entry point
├── css/
│   └── styles.css          # All styling
├── js/
│   ├── data.js             # Budget data (from votes.xlsx)
│   ├── config.js           # Firebase config placeholders
│   ├── firebase.js         # Firebase Realtime Database module
│   └── app.js              # React application
└── assets/
    └── ura-logo.png        # URA logo
```

## Tech Stack

- **React 18** (via CDN, no build step)
- **Chart.js 4** (charts and graphs)
- **jsPDF + autoTable** (PDF export)
- **Firebase Realtime Database** (live cloud sync, free tier)
- **TailAdmin-inspired CSS** (custom styles)
- **localStorage** (offline cache / fallback)

## Usage

1. **View Dashboard** — See budget overview, charts, and spending trends
2. **Monitor Votes** — Browse all votes, filter by category/status, click to see details
3. **Record Payments** — Click "Record Payment", select a vote, fill in details
4. **Generate Reports** — Filter and export to PDF/CSV
5. **Firebase Sync** — Connect Firebase once so all users share the same payments live

## License

Internal URA tool. Not for public distribution.
