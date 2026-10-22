# 🚀 LeetLens — LeetCode Rating & Progress Tracker

**Explore LeetCode problem ratings, track your solved problems, and monitor your algorithmic progress.**

LeetLens is a personal, offline-ready LeetCode problem tracker and rating explorer built with Vue 3 and TypeScript. It combines estimated problem difficulty ratings with personal progress tracking, helping you choose problems that match your goals.

🌐 **Live Demo:** [LeetLens](https://leet-lens.vercel.app/)  
📦 **Repository:** [AdiTyA-SiNgh-tech/LeetLens](https://github.com/AdiTyA-SiNgh-tech/LeetLens)

---

## ✨ Features

### ✅ Personal Problem Tracking
- Mark individual problems as **Solved** or **Unsolved**.
- Quickly identify completed problems with visual indicators.
- Persist your progress using browser `localStorage`.

### 📊 Progress Dashboard
- View total, solved, and unsolved problem counts.
- Track your overall completion percentage.
- Monitor progress within a selected rating range.

### 🔍 Search, Filter & Sort
- Filter problems by solved status.
- Set custom minimum and maximum rating boundaries.
- Search by problem ID or title in English or Chinese.
- Filter by weekly or biweekly contest.
- Sort by problem ID or estimated rating.

### 💾 Local Storage & Backups
- Save solved problem IDs locally without requiring an account.
- Export your progress to a JSON file.
- Import a previous backup to restore your progress.
- Validate imported data and avoid duplicate entries.

**Privacy:** Your personal solved status is stored in your browser. Progress is not automatically synchronized across browsers or devices.

### 🌐 Internationalization
- Switch between English and Simplified Chinese.
- Access the appropriate LeetCode website for each language.

### ⚡ Lightweight Deployment
- Runs as a frontend application.
- No personal database or backend is required for progress tracking.
- Hosted on Vercel with GitHub integration for updates.

---

## 🛠️ Tech Stack

- **Framework:** [Vue 3](https://vuejs.org/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Components:** [Element Plus](https://element-plus.org/)
- **Icons:** [Element Plus Icons](https://element-plus.org/en-US/component/icon.html)
- **Internationalization:** [Vue I18n](https://vue-i18n.intlify.dev/)
- **Build Tool:** Vue CLI / Webpack
- **Storage:** Browser `localStorage`
- **Hosting:** [Vercel](https://vercel.com/)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) — use a version supported by the project's dependencies.
- npm, included with Node.js.
- Git.

### 1. Clone the Repository

```bash
git clone https://github.com/AdiTyA-SiNgh-tech/LeetLens.git
cd LeetLens
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm run serve
```

Open the local URL displayed in your terminal.

### 4. Create a Production Build

```bash
npm run build
```

The production files are generated in the `dist` directory.

---

## 💾 Backing Up Your Progress

1. Open LeetLens.
2. Use the progress export option to download your JSON backup.
3. On another browser or device, open LeetLens and use the import option to restore your saved progress.

Your progress is browser-specific, so export backups regularly if you want to preserve your tracking data.

---

## 🌍 Deployment

LeetLens is deployed using Vercel.

To deploy your own version:

1. Fork or clone this repository.
2. Import the repository into [Vercel](https://vercel.com/).
3. Configure the build settings if they are not detected automatically.
4. Deploy the application.

Subsequent pushes to the connected GitHub repository can trigger automatic deployments.

---

## 🙌 Acknowledgements

- [zerotrac/leetcode_problem_rating](https://github.com/zerotrac/leetcode_problem_rating) — the original LeetCode problem-rating project that inspired this customized tracker.
- [LeetCode](https://leetcode.com/) — the platform for coding practice and contests.
- The open-source communities behind Vue, TypeScript, and Element Plus.

Please review the original project's license and retain any required attribution when redistributing modified versions.

---

## 📄 License

Refer to the original project's license and any applicable attribution requirements before redistributing this modified version.
