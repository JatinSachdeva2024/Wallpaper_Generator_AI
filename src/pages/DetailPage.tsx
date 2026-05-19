import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SaveOptionsSheet } from '../components/SaveOptionsSheet'
import { CATEGORY_MAP } from '../data/categories'
import { useGeneration } from '../context/GenerationContext'
import { fetchById } from '../services/wallpaperService'
import type { Wallpaper } from '../types/wallpaper'

export function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { refreshKey } = useGeneration()
  const [wallpaper, setWallpaper] = useState<Wallpaper | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setImageLoaded(false)
    fetchById(id).then((data) => {
      setWallpaper(data)
      setLoading(false)
    })
  }, [id, refreshKey])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-surface flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!wallpaper) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500 mb-4">Wallpaper not found</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-violet-400 text-sm"
        >
          Go back
        </button>
      </div>
    )
  }

  const category = CATEGORY_MAP[wallpaper.category]

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black flex flex-col max-w-lg mx-auto">
        <div className="relative flex-1 min-h-0">
          {!imageLoaded && (
            <div className="absolute inset-0 skeleton flex items-center justify-center">
              <p className="text-sm text-zinc-500">Loading image…</p>
            </div>
          )}
          <img
            src={wallpaper.imageUrl}
            alt={wallpaper.title}
            onLoad={() => setImageLoaded(true)}
            className={`h-full w-full object-cover transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />
        </div>

        <div className="absolute top-0 left-0 right-0 safe-top flex items-center justify-between p-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white"
            aria-label="Go back"
          >
            <BackIcon />
          </button>
          {wallpaper.isNewToday && (
            <span className="rounded-full bg-violet-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              New
            </span>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 safe-bottom p-4 pb-6">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-white">{wallpaper.title}</h1>
            <Link
              to={`/category/${wallpaper.category}`}
              className="mt-1 inline-flex items-center gap-1 text-sm text-zinc-300"
            >
              {category?.emoji} {category?.label}
            </Link>
            {wallpaper.prompt && (
              <p className="mt-2 text-xs text-zinc-500 line-clamp-2">
                {wallpaper.prompt}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSaveOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-semibold text-black active:scale-[0.98]"
            >
              <DownloadIcon />
              Save
            </button>
            <button
              type="button"
              onClick={() => setSaved((s) => !s)}
              className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl backdrop-blur-md transition-colors ${
                saved
                  ? 'bg-violet-600 text-white'
                  : 'bg-white/15 text-white active:bg-white/25'
              }`}
              aria-label={saved ? 'Saved' : 'Save to favorites'}
            >
              <HeartIcon filled={saved} />
            </button>
          </div>
        </div>
      </div>

      <SaveOptionsSheet
        open={saveOpen}
        title={wallpaper.title}
        imageUrl={wallpaper.imageUrl}
        onClose={() => setSaveOpen(false)}
      />
    </>
  )
}

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
  )
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </svg>
  )
}
