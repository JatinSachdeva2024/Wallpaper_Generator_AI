import { useState } from 'react'
import { useGeneration } from '../context/GenerationContext'

export function GenerateButton() {
  const { status, generating, startGeneration } = useGeneration()
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    if (generating) return
    setError(null)
    try {
      await startGeneration()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start')
    }
  }

  const progress =
    status && generating
      ? `${status.categoryIndex}/${status.totalCategories} · ${status.currentCategory ?? '…'}`
      : null

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-2 max-w-[calc(100vw-2rem)] safe-bottom pointer-events-none">
      {(generating || status?.message) && (
        <div className="rounded-2xl bg-surface-overlay/95 backdrop-blur-md border border-border px-3 py-2 text-xs text-zinc-300 max-w-[220px] text-right shadow-lg">
          {generating ? (
            <>
              <p className="font-medium text-violet-300">Generating new set…</p>
              <p className="mt-0.5 text-zinc-500">{status?.message}</p>
              {progress && (
                <p className="mt-1 text-zinc-600">{progress}</p>
              )}
              <p className="mt-1 text-[10px] text-zinc-600">
                ~15–30 min · keep app open
              </p>
            </>
          ) : status?.lastResult ? (
            <p className="text-emerald-400">
              {status.lastResult.total} wallpapers ready
            </p>
          ) : null}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleClick}
        disabled={generating}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-500/40 active:scale-95 disabled:opacity-70 disabled:active:scale-100 transition-all"
        aria-label="Generate wallpapers"
        title="Generate 10 new wallpapers per category"
      >
        {generating ? (
          <span className="h-6 w-6 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <span className="text-2xl leading-none">✨</span>
        )}
      </button>
    </div>
  )
}
