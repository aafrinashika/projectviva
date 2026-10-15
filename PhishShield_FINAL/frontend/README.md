# 📋 PhishShield AI — Technical Documentation

## 🧰 Tech Stack & Versions

| Tool / Package | Version (as installed) | Purpose |
|---|---|---|
| **React** | 19.x | UI library — component-based frontend |
| **React DOM** | 19.x | Renders React components to the browser DOM |
| **Vite** | 8.2.1 | Dev server + build tool (fast HMR, bundling) |
| **react-router-dom** | 6.x / 7.x (latest) | Client-side routing (page navigation without reload) |
| **@vitejs/plugin-react** | latest | Enables JSX + Fast Refresh in Vite |
| **Oxlint** | latest | Linter (checks code quality/errors) — chosen during `npm create vite` |
| **Font Awesome (CDN)** | 6.5.1 | Icons (`fas fa-*` classes used throughout) |

> Exact installed versions can be checked anytime with:
> ```bash
> npm list react react-dom vite react-router-dom
> ```

## 🌐 Dev Server Port

- Default port: **`5173`**
- Local URL: `http://localhost:5173`
- If port 5173 is busy, Vite auto-picks the next free port (5174, 5175...) — check terminal output for the actual URL.

## ▶️ Run Commands

| Command | What it does |
|---|---|
| `npm install` | Installs all dependencies listed in `package.json` |
| `npm run dev` | Starts local dev server with hot-reload at `localhost:5173` |
| `npm run build` | Creates optimized production build in `dist/` folder |
| `npm run preview` | Serves the production build locally to test before deploying |
| `npm run lint` | Runs Oxlint to check code issues |

## 📁 File-by-File Breakdown

### Root Files

| File | Purpose |
|---|---|
| `index.html` | HTML entry point — has `<div id="root">` where React mounts, and Font Awesome CDN link |
| `package.json` | Lists project dependencies, scripts (`dev`, `build`) |
| `vite.config.js` | Vite configuration (React plugin setup) |
| `.gitignore` | Tells Git which files/folders to ignore (node_modules, dist, etc.) |

### `src/` — Core App Files

| File | Purpose |
|---|---|
| `main.jsx` | Entry point — renders `<App />` into the HTML `#root` div |
| `App.jsx` | Defines all routes using `react-router-dom` (maps URL paths to page components) |
| `index.css` | Global styles — CSS variables (`--primary`, `--success`, etc.), resets, animations used across all pages |

### `src/components/` — Reusable UI Pieces

| File | Purpose |
|---|---|
| `Navbar.jsx` / `.css` | Top navigation bar shown only on the **Landing Page** — has logo, Features/About links, Login button |
| `Sidebar.jsx` / `.css` | Left sidebar layout wrapper used by **all dashboard pages** (Dashboard, Upload, Result, Hop, History, Reports, Admin) — includes nav links, collapse toggle, logout, and shared styles (cards, tables, badges, buttons used across dashboard pages) |

### `src/pages/` — Full Pages (mapped to routes)

| File | Route | Purpose |
|---|---|---|
| `LandingPage.jsx` / `.css` | `/` | Public homepage — hero section, stats, features grid, about section |
| `LoginPage.jsx` | `/login` | Login form — email, password, role selector (Individual/Admin), redirects based on role |
| `RegisterPage.jsx` | `/register` | Signup form — name, email, password + confirm, account type |
| `AuthPages.css` | — | Shared styling for both Login & Register (split-screen layout) |
| `DashboardPage.jsx` / `.css` | `/dashboard` | Individual user's home — scan stats, quick action cards, recent scans table |
| `UploadPage.jsx` / `.css` | `/upload` | Upload/paste email header for analysis — drag-drop zone + paste textarea tabs |
| `ResultPage.jsx` / `.css` | `/result` | Shows AI analysis result — animated risk gauge, SPF/DKIM/DMARC checks, phishing reasons list |
| `HopPage.jsx` / `.css` | `/hop` | Visualizes email transmission path (sender → servers → recipient) as connected nodes |
| `HistoryPage.jsx` / `.css` | `/history` | Searchable/filterable table of all past scans |
| `ReportsPage.jsx` / `.css` | `/reports` | Monthly report table + export buttons (PDF/CSV/Print) + recent generated reports list |
| `AdminDashboardPage.jsx` / `.css` | `/admin` | Organization-wide dashboard — org stats, recent analysis, security summary, phishing alerts, quarantine management |

## 🔀 Data Flow (Current State)

> ⚠️ **Important:** This is currently a **frontend-only prototype**. All data (`recentScans`, `mockResult`, `allScans`, etc.) is **hardcoded/static** inside each page's `.jsx` file — there is **no backend/API/database** connected yet.

```
User Action (click/submit)
        │
        ▼
React State (useState) — form inputs, filters, search
        │
        ▼
react-router-dom navigate() — moves to next page
        │
        ▼
Static/mock data rendered on screen
```

**Login/Register:** uses `setTimeout()` to simulate an API call (1.2s delay) — no real authentication happens.

## 🔮 Planned / Future Additions

*(Fill this in as you build further — placeholder section for now)*

- [ ] Backend API integration (Node/Express or similar)
- [ ] Real ML model for phishing detection
- [ ] Database for storing scan history (MongoDB/PostgreSQL)
- [ ] Real authentication (JWT/session-based)
- [ ] Actual PDF/CSV export functionality
- [ ] Real email header parsing logic

## Role-based navigation update

This version keeps the existing frontend pages and styling, but separates navigation by user role.

### Individual User
Dashboard → Analyze Email → History → Reports → Logout

### Organization User
Organization Dashboard → Recent Analysis → Phishing Alerts → Quarantine → Reports → Logout

Organization reports use `/admin/reports`, while individual reports remain at `/reports`. The selected role is stored client-side for the current frontend prototype and can later be replaced by the authenticated role returned from the backend.
