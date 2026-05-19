export function ApiError({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {message}
      <p className="mt-2 text-xs text-red-200/70">
        Run <code className="rounded bg-black/30 px-1">npm run dev</code> to
        start both the API server and the app.
      </p>
    </div>
  )
}
