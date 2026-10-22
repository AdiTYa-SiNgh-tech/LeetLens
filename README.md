# 🎯 LeetLens — LeetCode Problem Rating & Progress Tracker

[![Vue 3](https://img.shields.io/badge/Vue-3.2+-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.2+-409EFF?style=flat&logo=element&logoColor=white)](https://element-plus.org/)
[![Storage](https://img.shields.io/badge/Storage-Local_Browser_Storage-blue?style=flat&logo=googlechrome&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**LeetLens** is a clean, developer-focused LeetCode problem difficulty explorer and progress tracker. It pairs contest difficulty ratings calculated via the [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system) with a 100% client-side, local-first architecture. All tracking data stays completely private inside your own browser with zero account requirements, zero cloud dependencies, and full JSON backup/restore capabilities.

---

## 🌟 Key Features

### 🔒 1. 100% Local-First & Privacy-Focused
- **Zero Accounts Required**: No sign-up, login, passwords, or verification codes needed. The application opens immediately to your dashboard.
- **Client-Side Persistence**: Solved problems and settings are saved automatically to your browser's `localStorage` via a centralized and resilient storage service.
- **Corrupt-Proof & Self-Healing**: Handles missing or malformed stored data gracefully without crashing, automatically migrating legacy storage keys.
- **Complete Privacy**: Your solved problems never leave your machine and are never sent to external servers.

### 💾 2. Comprehensive Backup & Restore
- **JSON Export**: One-click download of your complete progress as `leetlens-backup-YYYY-MM-DD.json`, including schema version, timestamps, solved IDs, and settings.
- **JSON Import**: Easily restore or move progress across browsers or machines. Supports both:
  - **Merge**: Appends new solved problems while keeping existing progress intact.
  - **Replace**: Overwrites with backup data after confirmation.
- **Data Safety Notice**: Clear guidance explaining that browser storage is machine-specific and reminding users to take periodic backups before clearing browser cookies/cache.
- **Clear All Data**: Dedicated reset action with safety confirmation dialog.

### 📊 3. Modern, Minimal Developer Dashboard
- **Instant Metrics**: Real-time summary of Total Problems, Solved, Unsolved, and Completion Percentage.
- **Rating Tier Distribution**: Visual breakdown of your solved count across 4 Elo difficulty tiers:
  - 🟢 **Easy** (`< 1400`)
  - 🔵 **Medium** (`1400 – 1799`)
  - 🟡 **Hard** (`1800 – 2199`)
  - 🔴 **Expert** (`2200+`)

### ⚡ 4. Problem Explorer & Filtering
- **Status Filter**: Instant toggle between **All**, **Solved**, and **Unsolved** problems.
- **Elo Rating Boundaries**: Custom minimum and maximum rating interval filters.
- **Keyword & ID Search**: Real-time searching across problem ID, English title, or Chinese title.
- **Contest Filter**: Filter directly by Weekly or Biweekly contest number.
- **Interactive Checkboxes**: One-click status toggling with instant local persistence and subtle table indicators.
- **Custom Sorting**: Sort ascending or descending by problem ID or Elo difficulty.

### 🌐 5. Bilingual Support
- Full internationalization for **English** (linking to `leetcode.com`) and **简体中文** (linking to `leetcode.cn`).

---

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API, `<script setup lang="ts">`), TypeScript
- **UI Framework**: Element Plus, `@element-plus/icons-vue`
- **Data Storage**: Browser `localStorage` (via centralized `storageService`)
- **Localization**: `vue-i18n` (v9)
- **Build Tool**: Vue CLI / Webpack 5

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js `^20.0.0` or higher
- npm

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/AdiTyA-SiNgh-tech/LeetLens.git
cd LeetLens/leetcode_problem_rating
npm install
```

### 3. Run Development Server

```bash
npm run serve
```

Open your browser at `http://localhost:8080/`.

### 4. Build for Production

```bash
npm run build
```

The compiled assets will be ready in the `dist/` directory for deployment on Vercel, GitHub Pages, Netlify, or any static hosting service.

---

## 📦 Data & Storage Architecture

### Local Storage Schema

All user tracking data is encapsulated under the `leetlens_user_data` key in browser `localStorage`:

```typescript
{
  "version": 2,
  "appName": "LeetLens",
  "updatedAt": "2026-10-23T03:30:00.000Z",
  "solvedProblemIds": [1, 2, 15, 42, 100],
  "notes": {},
  "preferences": {
    "pageSize": 25,
    "locale": "en"
  }
}
```

### Backward Compatibility & Migration

`storageService` automatically detects and merges any progress previously stored in legacy keys:
- `leetcode_guest_solved_ids`
- `leetcode_solved_problem_ids`

No existing browser progress is lost when upgrading.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
