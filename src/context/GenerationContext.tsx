import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  fetchGenerationStatus,
  triggerGenerateAll,
  type GenerationStatus,
} from '../services/wallpaperService'

interface GenerationContextValue {
  status: GenerationStatus | null
  generating: boolean
  refreshKey: number
  startGeneration: () => Promise<void>
}

const defaultStatus: GenerationStatus = {
  running: false,
  currentCategory: null,
  categoryIndex: 0,
  totalCategories: 6,
  wallpaperIndex: 0,
  wallpapersPerCategory: 10,
  message: '',
  error: null,
  lastResult: null,
}

const GenerationContext = createContext<GenerationContextValue | null>(null)

export function GenerationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<GenerationStatus | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const wasRunning = useRef(false)

  const poll = useCallback(async () => {
    try {
      const s = await fetchGenerationStatus()
      setStatus(s)

      if (wasRunning.current && !s.running) {
        setRefreshKey((k) => k + 1)
      }
      wasRunning.current = s.running
    } catch {
      /* API offline */
    }
  }, [])

  useEffect(() => {
    poll()
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  }, [poll])

  const startGeneration = useCallback(async () => {
    const res = await triggerGenerateAll()
    if (!res.started) {
      throw new Error(res.message)
    }
    wasRunning.current = true
    await poll()
  }, [poll])

  const generating = status?.running ?? false

  return (
    <GenerationContext.Provider
      value={{ status, generating, refreshKey, startGeneration }}
    >
      {children}
    </GenerationContext.Provider>
  )
}

export function useGeneration() {
  const ctx = useContext(GenerationContext)
  if (!ctx) {
    return {
      status: defaultStatus,
      generating: false,
      refreshKey: 0,
      startGeneration: async () => {},
    }
  }
  return ctx
}
