import type { NavItem } from '@/components/organisms'
import { moduleNav, wsTickets } from '@/mocks'
import { formatTicketId, TICKET_STATUSES, type Ticket, type TicketStatus } from '@/types'

/** URL for a module's view: /inbox/all, /reports/overview… */
export const viewPath = (module: string, view: string) => `/${module}/${view}`

/** URL for a ticket opened from a view: /inbox/all/T-222. */
export const ticketPath = (view: string, id: number) => `/inbox/${view}/${formatTicketId(id)}`

/** "T-222" → 222. */
export const parseTicketId = (param: string | undefined) => {
  const n = Number(param?.replace(/^T-/i, ''))
  return Number.isInteger(n) && n > 0 ? n : undefined
}

const VIEW_STATUS: Record<string, TicketStatus> = { 'needs-response': 'open' }

/** Tickets an inbox view lists. The mock workspace is small, so most views show everything. */
export function ticketsForView(view: string): Ticket[] {
  const status = VIEW_STATUS[view] ?? (TICKET_STATUSES as readonly string[]).find((s) => s === view)
  if (status) return wsTickets.filter((t) => t.status === status)
  if (view === 'unassigned') return wsTickets.filter((t) => !t.assignee)
  return wsTickets
}

/** A module's first menu item — where the rail sends you. */
export function defaultView(module: string): string | undefined {
  return moduleNav[module]?.sections[0]?.items[0]?.id
}

/** Look a menu item up by id, including nested children (e.g. Lifecycle › Investigating). */
export function findNavItem(module: string, view: string): NavItem | undefined {
  const walk = (items: NavItem[]): NavItem | undefined => {
    for (const item of items) {
      if (item.id === view) return item
      const child = item.children && walk(item.children)
      if (child) return child
    }
    return undefined
  }
  for (const section of moduleNav[module]?.sections ?? []) {
    const hit = walk(section.items)
    if (hit) return hit
  }
  return undefined
}
