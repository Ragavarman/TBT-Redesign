import { createContext, useContext } from 'react'
import type { SavedReport } from '@/pages/reports/custom-report'
import type { SavedView } from '@/pages/tickets/ticket-view'

export interface SavedViewsValue {
  views: SavedView[]
  add: (view: SavedView) => void
  remove: (id: string) => void
  /** Custom reports (Figma R5), shown under Saved reports. */
  reports: SavedReport[]
  saveReport: (r: SavedReport) => void
}

export const SavedViewsContext = createContext<SavedViewsValue>({
  views: [],
  add: () => {},
  remove: () => {},
  reports: [],
  saveReport: () => {},
})

/** Views the agent saved from a ticket list (Figma T6). */
export const useSavedViews = () => useContext(SavedViewsContext)
