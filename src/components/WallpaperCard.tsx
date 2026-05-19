import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Wallpaper } from '../types/wallpaper'
import { CATEGORY_MAP } from '../data/categories'

interface WallpaperCardProps {
  wallpaper: Wallpaper
  index?: number
}

export function WallpaperCard({ wallpaper, index = 0 }: WallpaperCardProps) {
  const category = CATEGORY_MAP[wallpaper.category]
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  return (
    <Link
      to={`/wallpaper/${wallpaper.id}`}
      className="group relative block overflow-hidden rounded-2xl bg-surface-overlay animate-fade-up"
      style={{ animationDelay: `${index * 40}ms`, opacity: 0 }}
    >
      <div className="aspect-[9/16] w-full relative">
        {!loaded && !error && (
          <div className="absolute inset-0 skeleton" />
        )}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-overlay p-3 text-center">
            <span className="text-2xl">⚠️</span>
            <p className="text-[10px] text-zinc-500">Failed to load</p>
          </div>
        ) : (
          <img
            src={wallpaper.thumbnailUrl}
            alt={wallpaper.title}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`h-full w-full object-cover transition-all duration-500 group-active:scale-105 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />

      {wallpaper.isNewToday && (
        <span className="absolute top-2.5 left-2.5 rounded-full bg-violet-600/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm">
          New
        </span>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-3 pointer-events-none">
        <p className="text-sm font-medium text-white leading-tight truncate">
          {wallpaper.title}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-300">
          <span>{category?.emoji}</span>
          {category?.label}
        </p>
      </div>
    </Link>
  )
}
