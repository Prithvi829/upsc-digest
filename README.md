# UPSC Daily Digest

A free, self-hosted UPSC current affairs web app that auto-updates every day at 6 AM IST.
No paid APIs. No subscriptions. Runs entirely on Vercel's free tier.

---

## Deploy in 5 steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
gh repo create upsc-digest --public --push
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repo
3. Click **Deploy** (no config needed)

### 3. Add Vercel KV (free storage)
1. In your Vercel project → **Storage** tab → **Create Database** → **KV**
2. Name it `upsc-digest-kv` → Create
3. Click **Connect to Project** — this auto-adds the env vars

### 4. Redeploy
After adding KV, go to **Deployments** → **Redeploy** so the env vars take effect.

### 5. Trigger the first digest
Visit this URL once to generate your first digest:
```
https://your-app.vercel.app/api/generate
```

That's it! From now on the cron job runs every day at 6 AM IST automatically.

---

## Add to phone home screen

**Android (Chrome):** Open the site → tap ⋮ menu → "Add to Home screen"  
**iPhone (Safari):** Open the site → tap Share → "Add to Home Screen"

It opens like an app — no App Store needed.

---

## How it works

```
6:00 AM IST daily
     ↓
Vercel Cron → /api/generate
     ↓
Cheerio scrapes insightsonindia.com
     ↓
Stories tagged to GS papers automatically
     ↓
Saved to Vercel KV
     ↓
You open the app → instant load
```

---

## Cost

| Service | Cost |
|---------|------|
| Vercel hosting | Free |
| Vercel KV (30MB) | Free |
| Vercel Cron jobs | Free |
| Web scraping | Free |
| **Total** | **₹0/month** |

---

## Local development

```bash
npm install
cp .env.local.example .env.local
# Fill in KV credentials from Vercel dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Customise

- **Change scrape source**: Edit `lib/scraper.ts` — swap the URL to any UPSC site
- **Change cron time**: Edit `vercel.json` — `"30 0 * * *"` = 12:30 UTC = 6 AM IST
- **Add topics**: Edit the `paperMap` and `starredKeywords` arrays in `lib/scraper.ts`
