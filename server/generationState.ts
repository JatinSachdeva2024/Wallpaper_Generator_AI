import { CATEGORY_IDS, PROMPTS_PER_CATEGORY } from './categories.js'
import type { CategoryId } from './types.js'

export interface GenerationProgress {
  running: boolean
  currentCategory: CategoryId | null
  categoryIndex: number
  totalCategories: number
  wallpaperIndex: number
  wallpapersPerCategory: number
  message: string
  error: string | null
  lastResult: { batchDate: string; total: number } | null
}

export const generationProgress: GenerationProgress = {
  running: false,
  currentCategory: null,
  categoryIndex: 0,
  totalCategories: CATEGORY_IDS.length,
  wallpaperIndex: 0,
  wallpapersPerCategory: PROMPTS_PER_CATEGORY,
  message: '',
  error: null,
  lastResult: null,
}

export function setGenerationMessage(message: string) {
  generationProgress.message = message
}

export function startGenerationRun() {
  generationProgress.running = true
  generationProgress.error = null
  generationProgress.lastResult = null
  generationProgress.categoryIndex = 0
  generationProgress.wallpaperIndex = 0
  generationProgress.currentCategory = null
  generationProgress.message = 'Starting fresh batch…'
}

export function setCategoryProgress(
  category: CategoryId,
  categoryIndex: number,
  wallpaperIndex: number,
) {
  generationProgress.currentCategory = category
  generationProgress.categoryIndex = categoryIndex
  generationProgress.wallpaperIndex = wallpaperIndex
  generationProgress.message = `Generating ${category} (${wallpaperIndex}/${PROMPTS_PER_CATEGORY})…`
}

export function finishGenerationRun(result: { batchDate: string; total: number }) {
  generationProgress.running = false
  generationProgress.currentCategory = null
  generationProgress.lastResult = result
  generationProgress.message = `Done — ${result.total} wallpapers`
}

export function failGenerationRun(error: string) {
  generationProgress.running = false
  generationProgress.error = error
  generationProgress.message = 'Generation failed'
}

export function getGenerationStatus(): GenerationProgress {
  return { ...generationProgress }
}
