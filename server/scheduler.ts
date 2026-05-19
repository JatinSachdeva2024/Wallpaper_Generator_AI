import { CATEGORY_IDS, PROMPTS_PER_CATEGORY } from './categories.js'
import {
  countCategoryWallpapers,
  countWallpapers,
  getLatestBatchDate,
} from './db.js'
import {
  failGenerationRun,
  finishGenerationRun,
  getGenerationStatus,
  setGenerationMessage,
  startGenerationRun,
} from './generationState.js'
import { generateCategoryWallpapers, runDailyGeneration } from './generator.js'
import { todayString } from './openrouter.js'
import type { CategoryId } from './types.js'

let jobRunning = false

const DELAY_MS = Number(process.env.POLLINATIONS_DELAY_MS ?? 3000)

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

/** Fill only categories that are missing today's wallpapers */
export async function ensureTodaysWallpapers(): Promise<void> {
  const today = todayString()
  const expected = CATEGORY_IDS.length * PROMPTS_PER_CATEGORY
  const current = countWallpapers(today)

  if (current >= expected) {
    console.log(`[scheduler] Today complete — ${current} wallpapers`)
    return
  }

  console.log(`[scheduler] ${current}/${expected} wallpapers — filling gaps…`)

  for (const category of CATEGORY_IDS) {
    const count = countCategoryWallpapers(category as CategoryId, today)
    if (count >= PROMPTS_PER_CATEGORY) {
      console.log(`[scheduler] ✓ ${category} (${count})`)
      continue
    }

    console.log(`[scheduler] Generating ${category}…`)
    await generateCategoryWallpapers(category as CategoryId, today)
    await sleep(DELAY_MS)
  }
}

/** Full daily refresh — all 6 categories × 10 wallpapers */
export async function runScheduledJob(): Promise<{
  batchDate: string
  total: number
}> {
  if (jobRunning) {
    console.log('[scheduler] Job already running, skip')
    return { batchDate: todayString(), total: countWallpapers(todayString()) }
  }

  jobRunning = true
  startGenerationRun()
  try {
    const result = await runDailyGeneration()
    finishGenerationRun(result)
    return result
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    failGenerationRun(msg)
    throw err
  } finally {
    jobRunning = false
  }
}

/** Start generation in background (for UI button) */
export function startBackgroundGeneration(): {
  started: boolean
  message: string
} {
  if (jobRunning || getGenerationStatus().running) {
    return { started: false, message: 'Generation already in progress' }
  }

  jobRunning = true
  startGenerationRun()

  const batchDate = `${todayString()}-${Date.now()}`
  setGenerationMessage('Creating fresh wallpapers…')

  runDailyGeneration(batchDate)
    .then((result) => {
      finishGenerationRun(result)
      console.log(`[generate] Background job done — ${result.total} wallpapers`)
    })
    .catch((err) => {
      console.error('[generate] Background job failed:', err)
      failGenerationRun(err instanceof Error ? err.message : 'Failed')
    })
    .finally(() => {
      jobRunning = false
    })

  return { started: true, message: 'Generation started' }
}

export function getSchedulerStatus() {
  const today = todayString()
  const perCategory = CATEGORY_IDS.map((id) => ({
    category: id,
    count: countCategoryWallpapers(id as CategoryId, today),
    expected: PROMPTS_PER_CATEGORY,
  }))
  const gen = getGenerationStatus()
  return {
    today,
    latestBatch: getLatestBatchDate(),
    total: countWallpapers(today),
    expected: CATEGORY_IDS.length * PROMPTS_PER_CATEGORY,
    perCategory,
    jobRunning: jobRunning || gen.running,
    generation: gen,
    cronSchedule: process.env.CRON_SCHEDULE ?? '0 0 * * *',
    autoOnStart: process.env.AUTO_GENERATE_ON_START === 'true',
  }
}
