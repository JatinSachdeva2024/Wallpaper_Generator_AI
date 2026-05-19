import { Outlet } from 'react-router-dom'
import { GenerateButton } from './GenerateButton'
import { Header } from './Header'

export function Layout() {
  return (
    <div className="min-h-dvh flex flex-col max-w-lg mx-auto w-full">
      <Header />
      <main className="flex-1 px-4 pt-4 pb-24 safe-bottom">
        <Outlet />
      </main>
      <GenerateButton />
    </div>
  )
}
