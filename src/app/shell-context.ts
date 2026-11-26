import { createContext, useContext } from 'react'

export interface ShellValue {
  /** Ctrl K command menu. */
  openSearch: () => void
  /** Toggle the notifications panel. */
  toggleNotifications: () => void
  /** ? shortcuts list. */
  openShortcuts: () => void
  unreadNotifications: number
}

export const ShellContext = createContext<ShellValue>({
  openSearch: () => {},
  toggleNotifications: () => {},
  openShortcuts: () => {},
  unreadNotifications: 0,
})

export const useShell = () => useContext(ShellContext)
