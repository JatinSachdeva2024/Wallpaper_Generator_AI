import { useCallback, useEffect, useState } from 'react'
import { WallpaperGrid } from '../components/WallpaperGrid'
import { useGeneration } from '../context/GenerationContext'
import { fetchExplore } from '../services/wallpaperService'
import type { Wallpaper } from '../types/wallpaper'

export function ExplorePage() {
  const { refreshKey } = useGeneration()
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([])
  const [loading, setLoading] = useState(true)

  const loadRandom = useCallback(async () => {
    setLoading(true)
    const data = await fetchExplore(24)
    setWallpapers(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadRandom()
  }, [loadRandom, refreshKey])

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-cyan-400">
            Discover
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Explore</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Random wallpapers from every category
          </p>
        </div>
        <button
          type="button"
          onClick={loadRandom}
          disabled={loading}
          className="shrink-0 flex items-center gap-1.5 rounded-full bg-surface-overlay px-4 py-2.5 text-sm font-medium text-zinc-200 active:scale-95 disabled:opacity-50"
        >
          <ShuffleIcon spinning={loading} />
          Shuffle
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] rounded-2xl skeleton" />
          ))}
        </div>
      ) : (
        <WallpaperGrid wallpapers={wallpapers} />
      )}
    </div>
  )
}

function ShuffleIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={spinning ? 'animate-spin' : ''}
      aria-hidden
    >
      <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" />
    </svg>
  )
}
