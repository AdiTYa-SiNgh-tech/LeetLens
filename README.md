# 🎯 LeetLens — LeetCode Problem Rating & Progress Tracker

[![Vue 3](https://img.shields.io/badge/Vue-3.2+-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.2+-409EFF?style=flat&logo=element&logoColor=white)](https://element-plus.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%26_PostgreSQL-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**LeetLens** is a production-grade LeetCode problem difficulty explorer and progress tracker. It pairs contest difficulty ratings calculated via the [Elo rating system](https://en.wikipedia.org/wiki/Elo_rating_system) with real user authentication, cross-device cloud synchronization, Row Level Security (RLS), and a bespoke dark developer dashboard.

---

## 🌟 Key Features

### 🔐 1. Authentication & Cloud Synchronization
- **Supabase Authentication**: Email/password registration, secure sign-in, session recovery across browser restarts, and password reset flows.
- **Cross-Device Persistence**: Solved problems sync to PostgreSQL via Supabase with automatic conflict handling.
- **Strict Row Level Security (RLS)**: User isolation enforced at the database level (`auth.uid() = user_id`). User A can never read or mutate User B's progress.
- **Guest Mode Support**: Visitors can explore ratings, filter problems, and track progress locally without creating an account.
- **Safe First-Login Migration**: Detects pre-existing browser progress and offers to merge it safely into your cloud account without overwriting existing data.

### 📊 2. Modern SaaS Developer Dashboard
- **Live Metrics**: Total contest questions, solved count, unsolved count, and completion rate progress bar.
- **Difficulty Tier Breakdown**: Visual breakdown of your solved count across 4 Elo rating tiers:
  - 🟢 **Easy** (`< 1400`)
  - 🔵 **Medium** (`1400 – 1799`)
  - 🟡 **Hard** (`1800 – 2199`)
  - 🔴 **Expert** (`2200+`)
- **Active Range Indicator**: Live completion analytics for your currently filtered rating interval.

### ⚡ 3. Problem Explorer & Intelligent Filtering
- **Status Filter**: Toggle between **All**, **Solved**, and **Unsolved** problems.
- **Elo Rating Interval**: Custom `[min, max]` rating boundaries.
- **Keyword & ID Search**: Real-time matching by problem ID, English title, or Chinese title.
- **Contest Filter**: Filter directly by Weekly or Biweekly contest number.
- **Interactive Solved Toggle**: One-click checkbox with optimistic UI updates, green checkmark accents, and subtle row highlighting.
- **Custom Sorting**: Sort by problem ID or Elo difficulty in both directions.

### 💾 4. Backup & Migration (Export / Import)
- **JSON Export**: Download your solved problem set with timestamp and schema version.
- **JSON Import**: Restore progress on any device with structure validation and duplicate elimination.

### 🌐 5. Bilingual Support
- Full internationalization support for **English** (linking to `leetcode.com`) and **简体中文** (linking to `leetcode.cn`).

---

## 🛠️ Tech Stack

- **Frontend**: Vue 3 (Composition API, `<script setup lang="ts">`), TypeScript
- **UI Framework**: Element Plus, `@element-plus/icons-vue`
- **Backend & Auth**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Localization**: `vue-i18n` (v9)
- **Build Tool**: Vue CLI / Webpack 5

---

## 🗄️ Database Setup (Supabase Migration)

Execute the migration file located at [`supabase/migrations/001_user_progress.sql`](supabase/migrations/001_user_progress.sql) in your [Supabase SQL Editor](https://supabase.com/dashboard/project/ryxfacjgtxfybntnfjqi/sql):

```sql
-- 1. Create the user_solved_problems table
CREATE TABLE IF NOT EXISTS public.user_solved_problems (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, problem_id)
);

-- 2. Performance index
CREATE INDEX IF NOT EXISTS idx_user_solved_problems_user_id
  ON public.user_solved_problems (user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_solved_problems ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies (Owner isolation via auth.uid())
CREATE POLICY "Users can select own solved problems"
  ON public.user_solved_problems
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own solved problems"
  ON public.user_solved_problems
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own solved problems"
  ON public.user_solved_problems
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Permissions
GRANT SELECT, INSERT, DELETE ON public.user_solved_problems TO authenticated;
REVOKE ALL ON public.user_solved_problems FROM anon;
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root based on [`.env.example`](.env.example):

```bash
VUE_APP_SUPABASE_URL=https://ryxfacjgtxfybntnfjqi.supabase.co
VUE_APP_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

> **Security Note**: Only the Supabase **anon / publishable key** should be exposed in `VUE_APP_SUPABASE_PUBLISHABLE_KEY`. Never expose your service role key or database passwords in frontend code.

---

## 🚀 Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run serve
```
Visit [http://localhost:8080/](http://localhost:8080/) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## ☁️ Vercel Deployment

1. **Push your code** to GitHub.
2. In your [Vercel Dashboard](https://vercel.com/), select **Add New Project** and import your repository.
3. In **Project Settings → Environment Variables**, add:
   - `VUE_APP_SUPABASE_URL` = `https://ryxfacjgtxfybntnfjqi.supabase.co`
   - `VUE_APP_SUPABASE_PUBLISHABLE_KEY` = `<your-supabase-anon-key>`
4. In **Supabase Dashboard → Authentication → URL Configuration**:
   - **Site URL**: `https://leet-lens.vercel.app/`
   - **Redirect URLs**: Add:
     - `http://localhost:8080/`
     - `https://leet-lens.vercel.app/`
5. Click **Deploy**.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
Rating data and Elo methodology credited to [zerotrac](https://github.com/zerotrac/leetcode_problem_rating).
