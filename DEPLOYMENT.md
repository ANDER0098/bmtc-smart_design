# 🚀 How to Run and Deploy the BMTC Smart-ETM Project

This guide covers running the application locally on your computer and deploying it to **Netlify** or **Vercel**.

---

## 💻 1. How to Run Locally

### Prerequisites
- Node.js (v18.17+ or v20+ recommended)
- Terminal (PowerShell, Command Prompt, or Git Bash)

### Step 1: Open the Project Directory
Open your terminal and navigate to the project folder:
```powershell
cd "C:\Users\SHASHANK\.gemini\antigravity\scratch\bmtc-smart-etm"
```

### Step 2: Install Dependencies (if not already done)
```powershell
npm install
```

### Step 3: Run the Development Server
```powershell
npm run dev
```

### Step 4: Open in Your Browser
Visit [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🌐 2. How to Deploy to Netlify

### Option A: Deploy via GitHub (Recommended — Continuous Deployment)

1. **Push your code to a GitHub repository**:
   ```powershell
   git init
   git add .
   git commit -m "feat: BMTC Smart-ETM full implementation"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/bmtc-smart-etm.git
   git push -u origin main
   ```

2. **Log into Netlify** ([netlify.com](https://www.netlify.com/)):
   - Click **"Add new site"** → **"Import an existing project"**.
   - Select **GitHub** and authorize Netlify.
   - Choose your `bmtc-smart-etm` repository.

3. **Configure Build Settings** (Netlify will auto-detect from `netlify.toml`):
   - **Base directory**: (leave blank)
   - **Build command**: `npm run build` *(or `prisma generate && next build`)*
   - **Publish directory**: `.next`

4. Click **"Deploy site"**! Netlify will build and give you a live URL (`https://your-site-name.netlify.app`).

---

### Option B: Deploy using Netlify CLI (Direct Terminal Deployment)

1. Install Netlify CLI globally:
   ```powershell
   npm install -g netlify-cli
   ```

2. Log into your Netlify account:
   ```powershell
   netlify login
   ```

3. Initialize and deploy:
   ```powershell
   netlify init
   ```
   Follow the prompts on screen.

4. To deploy a production build anytime:
   ```powershell
   netlify deploy --build --prod
   ```

---

## ⚡ 3. How to Deploy to Vercel (Alternative — Recommended for Next.js)

Because **Next.js is created by Vercel**, deploying on Vercel is zero-config and provides the fastest builds with native Turbopack support.

### Option A: Deploy with Vercel Web Dashboard (1-Click)
1. Push code to GitHub.
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **"Add New..."** → **"Project"**.
4. Import your GitHub repository.
5. Click **"Deploy"** (all Next.js settings are auto-detected).

### Option B: Deploy with Vercel CLI (Instant from PowerShell)
```powershell
npx vercel
```
- Link to your Vercel account.
- Accept the default settings.
- For production:
  ```powershell
  npx vercel --prod
  ```

---

## ⌨️ Quick Keyboard Shortcuts in the App
| Key | Action |
|---|---|
| <kbd>Cmd</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> | Open Universal Command Palette |
| <kbd>O</kbd> | Toggle 10-Slide Overview Grid |
| <kbd>S</kbd> | Toggle Speaker Notes & Pacing Timer |
| <kbd>?</kbd> | Open Keyboard Shortcuts Cheat Sheet |
| <kbd>←</kbd> / <kbd>→</kbd> | Previous / Next Slide |
| `335E` | Honk BMTC Dual-Tone Bus Air Horn |
| <kbd>↑</kbd><kbd>↑</kbd><kbd>↓</kbd><kbd>↓</kbd><kbd>←</kbd><kbd>→</kbd><kbd>←</kbd><kbd>→</kbd><kbd>B</kbd><kbd>A</kbd> | Unlock Cyber Unit Livery + Disco Mode |
