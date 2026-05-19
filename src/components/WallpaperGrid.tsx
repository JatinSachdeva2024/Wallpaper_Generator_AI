import type { Wallpaper } from '../types/wallpaper'
import { WallpaperCard } from './WallpaperCard'

interface WallpaperGridProps {
  wallpapers: Wallpaper[]
}

export function WallpaperGrid({ wallpapers }: WallpaperGridProps) {
  if (wallpapers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
        <p className="text-4xl mb-3">🖼️</p>
        <p className="text-sm">No wallpapers yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {wallpapers.map((w, i) => (
        <WallpaperCard key={w.id} wallpaper={w} index={i} />
      ))}
    </div>
  )
}
