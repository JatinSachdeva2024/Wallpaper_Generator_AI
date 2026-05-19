# Aura — AI Wallpaper App

Automated mobile wallpaper app. **No manual prompts needed.**

## How automation works

```
Every day (midnight cron)
        ↓
OpenRouter AI writes 10 prompts × 6 categories (60 total)
        ↓
Pollinations generates images from each prompt
        ↓
Images + prompts saved to SQLite + data/images/
        ↓
React app reads from API and displays wallpapers
```

**Categories:** superhero, anime, nature, minimalist, city, abstract

---

## Quick start (development)

1. Copy `.env.example` → `.env.local` and add your keys:
   - `OPENROUTER_API_KEY` — [openrouter.ai/keys](https://openrouter.ai/keys)
   - `POLLINATIONS_API_KEY` — [enter.pollinations.ai](https://enter.pollinations.ai)

2. Run the app (API + frontend):

```bash
npm run dev
```

3. Open the URL shown (e.g. `http://localhost:5173`)

On first start, the server **auto-fills** any missing today's wallpapers.

---

## Automation options

### Option A — Built-in cron (easiest)

The server runs a daily job automatically while it's running.

`.env.local`:

```env
ENABLE_CRON=true
CRON_SCHEDULE=0 0 * * *          # midnight every day
AUTO_GENERATE_ON_START=true      # fill missing wallpapers on boot
```

Keep the server running 24/7 with:

```bash
npm run start
```

### Option B — Windows Task Scheduler

1. Open **Task Scheduler** → Create Basic Task
2. Trigger: Daily at 12:00 AM
3. Action: Start a program
   - Program: `powershell`
   - Arguments: `-File "C:\Users\asusa\Desktop\AI-wallpaper App\scripts\schedule-daily.ps1"`

Or run manually:

```bash
npm run cron:generate
```

### Option C — GitHub Actions (cloud, no PC needed)

1. Push repo to GitHub
2. Settings → Secrets → add `OPENROUTER_API_KEY`, `POLLINATIONS_API_KEY`
3. Workflow `.github/workflows/daily-wallpapers.yml` runs daily

Trigger manually: Actions → Daily wallpaper generation → Run workflow

---

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Dev mode — API + React with hot reload |
| `npm run start` | Production — build app + run API (serves UI) |
| `npm run cron:generate` | Run full daily job once (60 wallpapers) |
| `npm run generate:superhero` | Generate only superhero category |

---

## API

| Endpoint | Description |
|----------|-------------|
| `GET /api/health` | Status + wallpaper counts |
| `GET /api/wallpapers?category=anime` | Today's wallpapers |
| `POST /api/cron/generate` | Trigger full daily job |
| Header `x-cron-secret` | Required if `CRON_SECRET` is set |

---

## Production deploy

1. Set env vars on your host (Railway, Render, VPS, etc.)
2. `npm run start` — builds frontend and serves everything on port 3001
3. Enable `ENABLE_CRON=true` so daily generation runs on the server

**Note:** SQLite + local images work on a single server. For multiple instances, use Firebase/Postgres + cloud storage later.

---

## Env variables

See `.env.example` for the full list.

| Variable | Purpose |
|----------|---------|
| `OPENROUTER_API_KEY` | AI prompt generation |
| `POLLINATIONS_API_KEY` | Image generation |
| `CRON_SCHEDULE` | When to run daily job |
| `AUTO_GENERATE_ON_START` | Fill gaps when server starts |
| `POLLINATIONS_DELAY_MS` | Delay between images (avoid rate limits) |
