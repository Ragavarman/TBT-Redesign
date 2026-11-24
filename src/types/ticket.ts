/**
 * Helpdesk domain types (Figma 10 · Application-Specific Components).
 * Defined once here; glyphs, badges, lists and tables all read from these.
 */

export const TICKET_STATUSES = [
  'open',
  'investigating',
  'waiting',
  'on-hold',
  'resolved',
  'closed',
] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  open: 'Open',
  investigating: 'Investigating',
  waiting: 'Waiting',
  'on-hold': 'On hold',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}
