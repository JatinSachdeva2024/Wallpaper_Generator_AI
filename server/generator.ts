import { CATEGORY_IDS, PROMPTS_PER_CATEGORY } from './categories.js'
import {
  clearBatch,
  clearCategoryBatch,
  getWallpapersByCategory,
  insertWallpaper,
} from './db.js'
import { downloadAndSaveImage } from './imageStore.js'
import { generatePromptsForCategory, todayString } from './openrouter.js'
import { buildWallpaperUrls } from './pollinations.js'
import { setCategoryProgress, setGenerationMessage } from './generationState.js'
import type { CategoryId, Wallpaper } from './types.js'

export interface GenerateResult {
  batchDate: string
  category: CategoryId
  total: number
  wallpapers: Wallpaper[]
}

/** OpenRouter prompts → Pollinations URLs → download images → SQLite */
export async function generateCategoryWallpapers(
  category: CategoryId,
  batchDate = todayString(),
  categoryIndex = 1,
): Promise<GenerateResult> {
  console.log(`[generate] ${category} — OpenRouter → Pollinations → DB`)

  clearCategoryBatch(category, batchDate)
  const createdAt = new Date().toISOString()

  setGenerationMessage(`OpenRouter prompts for ${category}…`)
  console.log(`[generate] Fetching 10 prompts from OpenRouter…`)
  const prompts = await generatePromptsForCategory(category)

  const delayMs = Number(process.env.POLLINATIONS_DELAY_MS ?? 3000)

  for (let i = 0; i < prompts.length; i++) {
    const item = prompts[i]
    const index = i + 1
    setCategoryProgress(category, categoryIndex, index)
    const id = `${category}-${batchDate}-${String(index).padStart(2, '0')}`
    const { imageUrl, thumbnailUrl } = buildWallpaperUrls(item.prompt)

    if (i > 0 && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs))
    }

    let imageLocalPath: string | null = null
    try {
      imageLocalPath = await downloadAndSaveImage(imageUrl, id)
    } catch (err) {
      console.error(`[generate] Image download failed for ${id}:`, err)
    }

    insertWallpaper({
      id,
      title: item.title,
      category,
      prompt: item.prompt,
      image_url: imageUrl,
      thumbnail_url: thumbnailUrl,
      image_local_path: imageLocalPath,
      created_at: createdAt,
      batch_date: batchDate,
    })

    console.log(`[generate] ✓ ${index}/10 — ${item.title}`)
  }

  const wallpapers = getWallpapersByCategory(category, batchDate)
  console.log(`[generate] Done — ${wallpapers.length} ${category} wallpapers saved`)

  return {
    batchDate,
    category,
    total: wallpapers.length,
    wallpapers,
  }
}

export async function runDailyGeneration(
  batchDate = todayString(),
): Promise<{ batchDate: string; total: number }> {
  console.log(`[generate] New batch ${batchDate} — 60 wallpapers`)
  clearBatch(batchDate)
  let total = 0

  for (let c = 0; c < CATEGORY_IDS.length; c++) {
    const category = CATEGORY_IDS[c] as CategoryId
    setCategoryProgress(category, c + 1, 0)
    const result = await generateCategoryWallpapers(category, batchDate, c + 1)
    total += result.total
  }

  console.log(`[cron] Done — ${total} wallpapers saved for ${batchDate}`)
  return { batchDate, total }
}

