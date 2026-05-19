import { useEffect, useState } from 'react'
import { CATEGORIES } from '../data/categories'
import { CategoryCard } from '../components/CategoryCard'
import { useGeneration } from '../context/GenerationContext'
import { fetchTodaysByCategory } from '../services/wallpaperService'
import type { CategoryId } from '../types/wallpaper'

interface CategoryPreview {
  category: (typeof CATEGORIES)[0]
  count: number
  previewUrl: string
}

export function CategoriesPage() {
  const { refreshKey } = useGeneration()
  const [previews, setPreviews] = useState<CategoryPreview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const data = await Promise.all(
        CATEGORIES.map(async (cat) => {
          const wallpapers = await fetchTodaysByCategory(cat.id as CategoryId)
          return {
            category: cat,
            count: wallpapers.length,
            previewUrl: wallpapers[0]?.thumbnailUrl ?? '',
          }
        }),
      )
      setPreviews(data)
      setLoading(false)
    }
    load()
  }, [refreshKey])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pick a style — 10 new AI wallpapers every day
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[16/10] rounded-2xl skeleton" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {previews.map(({ category, count, previewUrl }, i) => (
            <CategoryCard
              key={category.id}
              category={category}
              wallpaperCount={count}
              previewUrl={previewUrl}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
