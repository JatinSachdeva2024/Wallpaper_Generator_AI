import type { CategoryId, Wallpaper } from '../types/wallpaper'

const API = '/api'

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, init)
  const body = await res.json().catch(() => ({}))
  if (!res.ok && res.status !== 202) {
    const errBody = body as { message?: string; error?: string }
    throw new Error(
      errBody.message ?? errBody.error ?? `API error: ${res.status}`,
    )
  }
  return body as T
}

export interface GenerationStatus {
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

export async function fetchTodaysByCategory(
  category: CategoryId,
): Promise<Wallpaper[]> {
  return api<Wallpaper[]>(`/wallpapers?category=${category}`)
}

export async function fetchByCategory(
  category: CategoryId,
): Promise<Wallpaper[]> {
  return fetchTodaysByCategory(category)
}

export async function fetchExplore(limit = 24): Promise<Wallpaper[]> {
  return api<Wallpaper[]>(`/wallpapers/explore?limit=${limit}`)
}

export async function fetchById(id: string): Promise<Wallpaper | null> {
  try {
    return await api<Wallpaper>(`/wallpapers/${id}`)
  } catch {
    return null
  }
}

export async function fetchAll(): Promise<Wallpaper[]> {
  return api<Wallpaper[]>('/wallpapers')
}

/** Start generating 10 wallpapers × 6 categories (runs in background) */
export async function triggerGenerateAll(): Promise<{
  started: boolean
  message: string
}> {
  return api('/generate/all', { method: 'POST' })
}

export async function fetchGenerationStatus(): Promise<GenerationStatus> {
  return api<GenerationStatus>('/generate/status')
}
