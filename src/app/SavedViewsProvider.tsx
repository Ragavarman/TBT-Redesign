import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SavedView } from '@/pages/tickets/ticket-view'
import { SavedViewsContext, type SavedViewsValue } from './saved-views-context'

const KEY = 'tbt-saved-views'

function load(): SavedView[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as SavedView[]) : []
  } catch {
    return []
  }
}

/**
 * Holds saved views for the session and remembers them in this browser (a convenience — the
 * mock app has no server to keep them).
 */
export function SavedViewsProvider({ children }: { children: ReactNode }) {
  const [views, setViews] = useState<SavedView[]>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(views))
    } catch {
      /* storage unavailable — views last for this session only */
    }
  }, [views])

  const value = useMemo<SavedViewsValue>(
    () => ({
      views,
      add: (v) => setViews((list) => [...list, v]),
      remove: (id) => setViews((list) => list.filter((v) => v.id !== id)),
    }),
    [views],
  )
  return <SavedViewsContext.Provider value={value}>{children}</SavedViewsContext.Provider>
}
