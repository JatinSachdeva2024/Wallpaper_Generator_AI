import './env.js'
import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getAllTodaysWallpapers,
  getRandomWallpapers,
  getWallpaperById,
  getWallpapersByCategory,
} from './db.js'
import { generateCategoryWallpapers } from './generator.js'
import { getImagesDir } from './imageStore.js'
import { getGenerationStatus } from './generationState.js'
import {
  getSchedulerStatus,
  runScheduledJob,
  startBackgroundGeneration,
} from './scheduler.js'
import { CATEGORY_IDS } from './categories.js'
import type { CategoryId } from './types.js'

const app = express()
const PORT = Number(process.env.PORT ?? 3001)
const isProd = process.env.NODE_ENV === 'production'

const corsOrigins = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim())
app.use(
  cors(
    corsOrigins?.length
      ? { origin: corsOrigins, credentials: true }
      : undefined,
  ),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, ...getSchedulerStatus() })
})

app.use('/api/images', express.static(getImagesDir()))

app.get('/api/wallpapers/explore', (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 24, 60)
  res.json(getRandomWallpapers(limit))
})

app.get('/api/wallpapers', (req, res) => {
  const category = req.query.category as CategoryId | undefined
  if (category && !CATEGORY_IDS.includes(category)) {
    res.status(400).json({ error: 'Invalid category' })
    return
  }
  const wallpapers = category
    ? getWallpapersByCategory(category)
    : getAllTodaysWallpapers()
  res.json(wallpapers)
})

app.get('/api/wallpapers/:id', (req, res) => {
  const wallpaper = getWallpaperById(req.params.id)
  if (!wallpaper) {
    res.status(404).json({ error: 'Not found' })
    return
  }
  res.json(wallpaper)
})

/** UI button — must be registered before /api/generate/:category */
app.post('/api/generate/all', (_req, res) => {
  const result = startBackgroundGeneration()
  if (!result.started) {
    res.status(409).json(result)
    return
  }
  res.status(202).json(result)
})

app.post('/api/generate/:category', async (req, res) => {
  const category = req.params.category as CategoryId
  if (!CATEGORY_IDS.includes(category)) {
    res.status(400).json({ error: 'Invalid category' })
    return
  }
  try {
    const result = await generateCategoryWallpapers(category)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Generation failed' })
  }
})

app.get('/api/generate/status', (_req, res) => {
  res.json(getGenerationStatus())
})

/** Cron / admin — full job (blocking) */
app.post('/api/cron/generate', async (req, res) => {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers['x-cron-secret'] !== secret) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  try {
    const result = await runScheduledJob()
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Generation failed' })
  }
})

if (isProd) {
  const dist = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'dist',
  )
  app.use(express.static(dist))
  app.get(/^(?!\/api).*/, (_req, res) => {
    res.sendFile(path.join(dist, 'index.html'))
  })
}

const cronSchedule = process.env.CRON_SCHEDULE ?? '0 0 * * *'
const cronEnabled = process.env.ENABLE_CRON === 'true'

if (cronEnabled) {
  cron.schedule(cronSchedule, async () => {
    console.log('[cron] Daily job started')
    try {
      await runScheduledJob()
    } catch (err) {
      console.error('[cron] Daily job failed:', err)
    }
  })
  console.log(`[cron] Scheduled: ${cronSchedule}`)
}

async function boot() {
  console.log(`API running at http://localhost:${PORT}`)
  if (process.env.AUTO_GENERATE_ON_START === 'true') {
    startBackgroundGeneration()
  } else {
    console.log('[boot] Manual generate — use the ✨ button in the app')
  }
}

if (isProd) {
  app.listen(PORT, boot)
} else {
  app.listen(PORT, boot)
}
