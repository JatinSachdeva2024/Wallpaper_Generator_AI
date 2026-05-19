import { useEffect, useState } from 'react'
import {
  canUseNativeShare,
  saveToFiles,
  saveToPhotos,
} from '../utils/saveImage'

interface SaveOptionsSheetProps {
  open: boolean
  title: string
  imageUrl: string
  onClose: () => void
}

export function SaveOptionsSheet({
  open,
  title,
  imageUrl,
  onClose,
}: SaveOptionsSheetProps) {
  const [saving, setSaving] = useState<'photos' | 'files' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setError(null)
      setSaving(null)
    }
  }, [open])

  if (!open) return null

  async function handlePhotos() {
    setSaving('photos')
    setError(null)
    try {
      await saveToPhotos(title, imageUrl)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  async function handleFiles() {
    setSaving('files')
    setError(null)
    try {
      await saveToFiles(title, imageUrl)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-labelledby="save-title"
        className="relative w-full max-w-lg mx-auto rounded-t-3xl bg-surface-raised border-t border-border p-4 pb-8 safe-bottom animate-fade-up"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-600" />
        <h2 id="save-title" className="text-lg font-semibold text-white mb-1">
          Save wallpaper
        </h2>
        <p className="text-sm text-zinc-500 mb-4 truncate">{title}</p>

        {error && (
          <p className="mb-3 text-sm text-red-400 bg-red-500/10 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePhotos}
            disabled={!!saving}
            className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4 text-left active:bg-white/15 disabled:opacity-50"
          >
            <span className="text-2xl">🖼️</span>
            <div>
              <p className="font-medium text-white">Save to Photos</p>
              <p className="text-xs text-zinc-500">
                {canUseNativeShare()
                  ? 'Opens share sheet → choose Save Image'
                  : 'Best on iPhone & Android'}
              </p>
            </div>
            {saving === 'photos' && <Spinner />}
          </button>

          <button
            type="button"
            onClick={handleFiles}
            disabled={!!saving}
            className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-4 text-left active:bg-white/15 disabled:opacity-50"
          >
            <span className="text-2xl">📁</span>
            <div>
              <p className="font-medium text-white">Save to Files</p>
              <p className="text-xs text-zinc-500">Downloads to your device</p>
            </div>
            {saving === 'files' && <Spinner />}
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-2xl py-3 text-sm font-medium text-zinc-400 active:bg-white/5"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <span className="ml-auto h-5 w-5 shrink-0 rounded-full border-2 border-violet-400 border-t-transparent animate-spin" />
  )
}
