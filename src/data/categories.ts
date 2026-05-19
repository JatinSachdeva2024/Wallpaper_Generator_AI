import type { Category, CategoryId } from '../types/wallpaper'

export const CATEGORIES: Category[] = [
  {
    id: 'superhero',
    label: 'Superhero',
    emoji: '🦸',
    gradient: 'from-red-500/80 to-blue-600/80',
  },
  {
    id: 'anime',
    label: 'Anime',
    emoji: '✨',
    gradient: 'from-pink-500/80 to-violet-600/80',
  },
  {
    id: 'nature',
    label: 'Nature',
    emoji: '🌿',
    gradient: 'from-emerald-500/80 to-teal-600/80',
  },
  {
    id: 'minimalist',
    label: 'Minimalist',
    emoji: '◻️',
    gradient: 'from-slate-400/80 to-zinc-600/80',
  },
  {
    id: 'city',
    label: 'City',
    emoji: '🌃',
    gradient: 'from-amber-500/80 to-orange-600/80',
  },
  {
    id: 'abstract',
    label: 'Abstract',
    emoji: '🎨',
    gradient: 'from-fuchsia-500/80 to-cyan-500/80',
  },
]

export const CATEGORY_MAP = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>
