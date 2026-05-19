import { Link } from 'react-router-dom'
import type { Category } from '../types/wallpaper'
import type { Wallpaper } from '../types/wallpaper'
import { WallpaperCard } from './WallpaperCard'

interface CategorySectionProps {
  category: Category
  wallpapers: Wallpaper[]
}

export function CategorySection({ category, wallpapers }: CategorySectionProps) {
  const preview = wallpapers.slice(0, 4)

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{category.emoji}</span>
          <div>
            <h2 className="text-base font-semibold">{category.label}</h2>
            <p className="text-[11px] text-zinc-500">
              {wallpapers.length} new today · AI generated
            </p>
          </div>
        </div>
        <Link
          to={`/category/${category.id}`}
          className="text-xs font-medium text-violet-400 active:text-violet-300"
        >
          See all →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {preview.map((w, i) => (
          <WallpaperCard key={w.id} wallpaper={w} index={i} />
        ))}
      </div>
    </section>
  )
}
