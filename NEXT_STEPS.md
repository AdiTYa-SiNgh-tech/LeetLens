# 🚀 LeetLens — Setup & Deployment Checklist

This guide contains everything you need to know and the exact steps to deploy **LeetLens** to production.

---

## ✅ What Has Already Been Completed

1. **Database Migration**:
   - `user_solved_problems` table is created in your Supabase database.
   - Row Level Security (RLS) is active with policies ensuring complete user data isolation.
2. **Local Environment Configured**:
   - Your `.env` file is created with your Supabase URL and `anon` key.
3. **Clean & Minimal UI Redesign**:
   - Light GitHub/Linear-inspired interface.
   - Single-row dashboard, clean rating tiers, dense problem table, and unified toolbar.
4. **Build & Lint Verification**:
   - `npm run lint` passes with 0 errors.
   - `npm run build` generates the complete production bundle in `dist/`.
   - Local dev server is running on `http://localhost:8080/`.

---

## 📋 What You Need To Do Next (3 Simple Steps)

### Step 1: Configure Supabase Auth URLs (1 minute)

1. Open your **[Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/ryxfacjgtxfybntnfjqi/auth/url-configuration)**.
2. In **Site URL**, enter:
   ```
   https://leet-lens.vercel.app/
   ```
3. In **Redirect URLs**, add both of these lines:
   ```
   http://localhost:8080/
   https://leet-lens.vercel.app/
   ```
4. Click **Save**.

---

### Step 2: Push Your Code to GitHub (1 minute)

Open your terminal in the `leetcode_problem_rating` folder and run:

```bash
git add .
git commit -m "feat: complete LeetLens upgrade with Supabase cloud sync and clean minimal UI"
git push origin main
```

*(Note: Your `.env` file is in `.gitignore`, so your private keys will never be committed to GitHub).*

---

### Step 3: Add Environment Variables in Vercel & Deploy (2 minutes)

1. Open your **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Select your **LeetLens** project (`leet-lens`).
3. Go to **Settings** → **Environment Variables**.
4. Add the following two variables:

| Key | Value |
| :--- | :--- |
| `VUE_APP_SUPABASE_URL` | `https://ryxfacjgtxfybntnfjqi.supabase.co` |
| `VUE_APP_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5eGZhY2pndHhmeWJudG5manFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2OTMzOTMsImV4cCI6MjEwODI2OTM5M30.qxfbo6P6hNavb77sw0z6ghW2FHGKONfJ575kX47HNQc` |

5. Under the **Deployments** tab, click the three dots (`...`) on the latest deployment and click **Redeploy** (or simply push the git commit from Step 2).

---

## 🧪 How to Verify Everything Works

### Local Testing:
1. Open [http://localhost:8080/](http://localhost:8080/).
2. Click **Create Account** in the top right.
3. Sign up with your email and password.
4. Check off any problem as solved. Notice the **Cloud Synced** green dot.
5. Check your **[Supabase Table Editor](https://supabase.com/dashboard/project/ryxfacjgtxfybntnfjqi/editor)** under `user_solved_problems` to see your rows saved in real-time.

### Production Testing:
1. Once Vercel finishes deploying, visit your live site: **[https://leet-lens.vercel.app/](https://leet-lens.vercel.app/)**.
2. Sign in with the account you created.
3. Your solved problems will automatically sync to your live site across any device!

---

## 💻 Daily Development Commands

- **Start Local Server**:
  ```bash
  npm run serve
  ```
- **Create Production Build**:
  ```bash
  npm run build
  ```
- **Check Lint / Format**:
  ```bash
  npm run lint
  ```
