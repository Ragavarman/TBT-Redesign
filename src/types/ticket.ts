import type { Agent, Customer, Person } from './people'

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

export const SLA_STATES = ['on-track', 'at-risk', 'breached'] as const
export type SlaState = (typeof SLA_STATES)[number]

export const SLA_STATE_LABEL: Record<SlaState, string> = {
  'on-track': 'On track',
  'at-risk': 'At risk',
  breached: 'Breached',
}

export type TicketChannel = 'email' | 'chat' | 'phone' | 'portal'

export interface TicketSla {
  state: SlaState
  /** Human text, e.g. "1h 20m left". */
  label: string
}

export interface Ticket {
  /** Display number, e.g. 4821 → "#4821". */
  id: number
  subject: string
  /** First line of the latest message, for list previews. */
  preview: string
  status: TicketStatus
  priority: TicketPriority
  requester: Customer
  assignee?: Agent
  team: string
  channel: TicketChannel
  tags: string[]
  sla?: TicketSla
  /** ISO timestamps. */
  createdAt: string
  updatedAt: string
  /** Has activity the current agent hasn't seen. */
  unread?: boolean
  messageCount: number
}

export type TicketEventType = 'comment' | 'status' | 'assignment' | 'system'

export interface TicketEvent {
  id: string
  type: TicketEventType
  actor?: Person
  /** For comments: the message. For others: the action text. */
  text: string
  /** status events */
  status?: TicketStatus
  /** assignment events */
  assignee?: Person
  /** Internal note (not visible to the requester). */
  internal?: boolean
  at: string
}
