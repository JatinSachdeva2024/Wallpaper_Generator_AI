import type { CategoryId } from './types.js'

export const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: 'superhero', label: 'Superhero' },
  { id: 'anime', label: 'Anime' },
  { id: 'nature', label: 'Nature' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'city', label: 'City' },
  { id: 'abstract', label: 'Abstract' },
]

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id)

export const PROMPTS_PER_CATEGORY = 10
