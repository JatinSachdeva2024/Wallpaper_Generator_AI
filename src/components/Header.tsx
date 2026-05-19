import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'New', path: '/' },
  { label: 'Categories', path: '/categories' },
  { label: 'Explore', path: '/explore' },
] as const

export function Header() {
  const location = useLocation()

  function isActive(path: string) {
    if (path === '/categories') {
      return (
        location.pathname === '/categories' ||
        location.pathname.startsWith('/category/')
      )
    }
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname === path
  }

  return (
    <header className="sticky top-0 z-50 safe-top bg-surface/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-2 px-4 pt-3 pb-3 max-w-lg mx-auto">
        <Link to="/" className="flex items-center gap-2 shrink-0 mr-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-white shadow-lg shadow-violet-500/25">
            A
          </span>
          <p className="text-sm font-semibold leading-tight tracking-tight">
            Aura
          </p>
        </Link>

        <nav
          className="flex flex-1 rounded-2xl bg-surface-overlay p-1"
          aria-label="Main navigation"
        >
          {TABS.map((tab) => {
            const active = isActive(tab.path)
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex-1 rounded-xl py-2 text-center text-sm font-medium transition-all ${
                  active
                    ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md shadow-violet-500/25'
                    : 'text-zinc-400 active:text-zinc-200'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
