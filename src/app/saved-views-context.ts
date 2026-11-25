import { createContext, useContext } from 'react'
import type { SavedView } from '@/pages/tickets/ticket-view'

export interface SavedViewsValue {
  views: SavedView[]
  add: (view: SavedView) => void
  remove: (id: string) => void
}

export const SavedViewsContext = createContext<SavedViewsValue>({
  views: [],
  add: () => {},
  remove: () => {},
})

/** Views the agent saved from a ticket list (Figma T6). */
export const useSavedViews = () => useContext(SavedViewsContext)
