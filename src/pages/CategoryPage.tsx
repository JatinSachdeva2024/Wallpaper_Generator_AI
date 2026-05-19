import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CATEGORY_MAP } from '../data/categories'
import { WallpaperGrid } from '../components/WallpaperGrid'
import { useGeneration } from '../context/GenerationContext'
import { fetchTodaysByCategory } from '../services/wallpaperService'
import type { CategoryId, Wallpaper } from '../types/wallpaper'

export function CategoryPage() {
  const { refreshKey } = useGeneration()
  const { categoryId } = useParams<{ categoryId: string }>()
  const category =
    categoryId && categoryId in CATEGORY_MAP
      ? CATEGORY_MAP[categoryId as CategoryId]
      : undefined
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!categoryId || !category) return
    setLoading(true)
    fetchTodaysByCategory(categoryId as CategoryId).then((data) => {
      setWallpapers(data)
      setLoading(false)
    })
  }, [categoryId, category, refreshKey])

  if (!category) {
    return (
      <div className="py-16 text-center text-zinc-500">
        <p className="text-4xl mb-3">🔍</p>
        <p>Category not found</p>
      </div>
    )
  }

  return (
    <div>
      <Link
        to="/categories"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 active:text-white"
      >
        <BackIcon />
        Categories
      </Link>

      <div
        className={`mb-6 rounded-2xl bg-gradient-to-br ${category.gradient} p-5`}
      >
        <span className="text-3xl">{category.emoji}</span>
        <h1 className="mt-2 text-2xl font-bold text-white">{category.label}</h1>
        <p className="mt-1 text-sm text-white/80">
          {wallpapers.length} AI wallpapers · refreshed today
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-2xl skeleton" />
          ))}
        </div>
      ) : (
        <WallpaperGrid wallpapers={wallpapers} />
      )}
    </div>
  )
}

function BackIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}
