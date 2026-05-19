import { Link } from 'react-router-dom'
import type { Category } from '../types/wallpaper'

interface CategoryCardProps {
  category: Category
  wallpaperCount: number
  previewUrl: string
  index?: number
}

export function CategoryCard({
  category,
  wallpaperCount,
  previewUrl,
  index = 0,
}: CategoryCardProps) {
  return (
    <Link
      to={`/category/${category.id}`}
      className="group relative block overflow-hidden rounded-2xl animate-fade-up"
      style={{ animationDelay: `${index * 60}ms`, opacity: 0 }}
    >
      <div className="aspect-[16/10] w-full relative">
        <img
          src={previewUrl}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${category.gradient} mix-blend-multiply`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <span className="text-3xl mb-1">{category.emoji}</span>
        <h2 className="text-lg font-bold text-white">{category.label}</h2>
        <p className="mt-0.5 text-xs text-white/70">
          {wallpaperCount} AI wallpapers · updated daily
        </p>
      </div>
    </Link>
  )
}
