export function ApiError({ message }: { message: string }) {
  const isProd = import.meta.env.PROD

  return (
    <div className="mb-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
      {message}
      {isProd ? (
        <p className="mt-2 text-xs text-red-200/70 leading-relaxed">
          Deploy the API (Railway/Render), then in Vercel → Settings →
          Environment Variables set{' '}
          <code className="rounded bg-black/30 px-1">VITE_API_URL</code> to your
          API URL ending in <code className="rounded bg-black/30 px-1">/api</code>
          , and redeploy.
        </p>
      ) : (
        <p className="mt-2 text-xs text-red-200/70">
          Run <code className="rounded bg-black/30 px-1">npm run dev</code> to
          start both the API server and the app.
        </p>
      )}
    </div>
  )
}
