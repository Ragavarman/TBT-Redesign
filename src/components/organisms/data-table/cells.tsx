import type { ReactNode } from 'react'
import { Avatar } from '@/components/atoms'

/**
 * Body-cell renderers for the Figma 08 · Table cell types that aren't already a molecule.
 * (status → TicketStatusBadge, badge → Badge, checkbox/actions are built into DataTable.)
 */

/** type=person — 20px avatar + name. */
export function PersonCell({ name, avatarUrl }: { name?: string; avatarUrl?: string }) {
  if (!name) return <span className="text-small text-muted-foreground">Unassigned</span>
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar name={name} src={avatarUrl} size="xs" aria-hidden />
      <span className="truncate">{name}</span>
    </span>
  )
}

/** type=muted — Small, muted (timestamps, counts, secondary text). */
export function MutedCell({ children }: { children: ReactNode }) {
  return <span className="text-small whitespace-nowrap text-muted-foreground">{children}</span>
}

/** type=text with a secondary line — primary text + muted sub-line, both truncated. */
export function TwoLineCell({ primary, secondary }: { primary: ReactNode; secondary?: ReactNode }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate">{primary}</span>
      {secondary && <span className="truncate text-small text-muted-foreground">{secondary}</span>}
    </span>
  )
}
