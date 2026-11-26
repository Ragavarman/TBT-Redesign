import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SavedReport } from '@/pages/reports/custom-report'
import type { SavedView } from '@/pages/tickets/ticket-view'
import { SavedViewsContext, type SavedViewsValue } from './saved-views-context'

const KEY = 'tbt-saved-views'
const REPORTS_KEY = 'tbt-saved-reports'

function load<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

/**
 * Holds saved views for the session and remembers them in this browser (a convenience — the
 * mock app has no server to keep them).
 */
export function SavedViewsProvider({ children }: { children: ReactNode }) {
  const [views, setViews] = useState<SavedView[]>(() => load(KEY))
  const [reports, setReports] = useState<SavedReport[]>(() => load(REPORTS_KEY))

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(views))
    } catch {
      /* storage unavailable — views last for this session only */
    }
  }, [views])
  useEffect(() => {
    try {
      localStorage.setItem(REPORTS_KEY, JSON.stringify(reports))
    } catch {
      /* storage unavailable */
    }
  }, [reports])

  const value = useMemo<SavedViewsValue>(
    () => ({
      views,
      add: (v) => setViews((list) => [...list, v]),
      remove: (id) => setViews((list) => list.filter((v) => v.id !== id)),
      reports,
      saveReport: (r) =>
        setReports((list) =>
          list.some((x) => x.id === r.id) ? list.map((x) => (x.id === r.id ? r : x)) : [...list, r],
        ),
    }),
    [views, reports],
  )
  return <SavedViewsContext.Provider value={value}>{children}</SavedViewsContext.Provider>
}
