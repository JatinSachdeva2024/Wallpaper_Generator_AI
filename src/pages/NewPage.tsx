import { useCallback, useEffect, useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { ApiError } from '../components/ApiError'
import { CategorySection } from '../components/CategorySection'
import { useGeneration } from '../context/GenerationContext'
import { fetchTodaysByCategory } from '../services/wallpaperService'
import type { CategoryId, Wallpaper } from '../types/wallpaper'

export function NewPage() {
  const { refreshKey } = useGeneration()
  const [sections, setSections] = useState<
    { category: (typeof CATEGORIES)[0]; wallpapers: Wallpaper[] }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await Promise.all(
        CATEGORIES.map(async (cat) => ({
          category: cat,
          wallpapers: await fetchTodaysByCategory(cat.id as CategoryId),
        })),
      )
      setSections(data)
    } catch {
      setError(
        import.meta.env.PROD
          ? 'Could not reach the API. Set VITE_API_URL on Vercel to your hosted backend.'
          : 'Could not reach the API. Run npm run dev (starts API + frontend).',
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div>
      {error && <ApiError message={error} />}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-violet-400">
          Daily drop
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">New today</h1>
        <p className="mt-1 text-sm text-zinc-500">{today}</p>
        <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
          Tap ✨ bottom-right to generate 10 AI wallpapers per category.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-2xl skeleton" />
          ))}
        </div>
      ) : (
        sections.map(({ category, wallpapers }) => (
          <CategorySection
            key={category.id}
            category={category}
            wallpapers={wallpapers}
          />
        ))
      )}
    </div>
  )
}
