import type { TicketStatus } from '@/types'

/** Reports · Overview (Figma Interface 227:27366), Nov 11 – 18, 2026. Illustrative values. */
export const reportRange = { label: 'Nov 11 – Nov 18, 2026', short: 'Nov 11 – 18' }

export const reportKpis = {
  open: { value: 67, delta: '+12', caption: 'vs last week' },
  needsFirstResponse: { value: 8, caption: '3 waiting over 1h' },
  resolved: { value: 4, caption: 'this week' },
  slaBreached: { value: 1, caption: 'T-219 · Acme Corp' },
  medianFirstResponse: { value: '42m', caption: 'target 1h' },
}

/** Tickets created vs resolved per day. Peak is Nov 17. */
export const createdVsResolved = [
  { label: 'Nov 11', values: { created: 25, resolved: 21 } },
  { label: 'Nov 12', values: { created: 35, resolved: 31 } },
  { label: 'Nov 13', values: { created: 20, resolved: 20 } },
  { label: 'Nov 14', values: { created: 45, resolved: 37 } },
  { label: 'Nov 15', values: { created: 30, resolved: 21 } },
  { label: 'Nov 16', values: { created: 55, resolved: 39 } },
  { label: 'Nov 17', values: { created: 65, resolved: 41 } },
  { label: 'Nov 18', values: { created: 28, resolved: 23 } },
]
export const createdVsResolvedPeak = 6

/** Open tickets by status (67 in total). */
export const ticketsByStatus: { status: TicketStatus; label: string; value: number }[] = [
  { status: 'open', label: 'Needs first response', value: 8 },
  { status: 'investigating', label: 'Investigating', value: 41 },
  { status: 'waiting', label: 'Waiting for customer', value: 12 },
  { status: 'on-hold', label: 'On hold', value: 0 },
  { status: 'resolved', label: 'Resolved', value: 4 },
  { status: 'closed', label: 'Closed', value: 2 },
]
