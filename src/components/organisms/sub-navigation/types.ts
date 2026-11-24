import type { ReactElement, ReactNode } from 'react'
import type { IconName } from '@/components/atoms'

/** One row in a module's sub-navigation. */
export interface NavItem {
  id: string
  label: string
  /** TBT icon name, or an element such as <StatusGlyph /> for saved views. */
  icon?: IconName | ReactElement
  count?: ReactNode
  unread?: boolean
  /** Link target. Without it the row is a button that calls `onSelect`. */
  href?: string
  /** Show a trailing chevron instead of a count (opens a browser / sub-page). */
  chevron?: boolean
  /** Nested level-1 rows (e.g. status views under "All tickets"). */
  children?: NavItem[]
  disabled?: boolean
}

/** A block of rows, optionally under a group label. */
export interface NavSection {
  id: string
  /** Group label (Caption, muted). Omit for the top block. */
  label?: string
  /** Trailing + on the group label, e.g. "New view". */
  action?: { label: string; onClick: () => void }
  /** Group can be collapsed by clicking its label. */
  collapsible?: boolean
  items: NavItem[]
}

/** A module in the app rail (Inbox, Customers, …). */
export interface RailModule {
  id: string
  label: string
  icon: IconName
  /** Destructive notification dot. */
  dot?: boolean
}

export interface NavUser {
  name: string
  avatarUrl?: string
  presence?: 'online' | 'away' | 'offline'
}

export type NavHeaderActions = ReactNode
