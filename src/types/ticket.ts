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

/** Display id used across the interface (Figma: "T-221"). */
export const formatTicketId = (id: number) => `T-${id}`

export type TicketChannel = 'email' | 'chat' | 'phone' | 'portal'

export interface TicketSla {
  state: SlaState
  /** Human text, e.g. "1h 20m left". */
  label: string
}

export interface Ticket {
  /** Ticket number, e.g. 221. Display it with formatTicketId → "T-221". */
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

/* ── Ticket detail (Figma Interface · T1–T3) ─────────────────────────────────────────── */

/** Timeline filter groups (Figma T3 chips: All / Messages / Notes / Status / Calls). */
export type TicketActivityKind = 'message' | 'note' | 'status' | 'call'

/** One entry on the ticket's full timeline. */
export interface TicketActivity {
  id: string
  kind: TicketActivityKind
  /** Who did it — a person, or "System" for routing rules. */
  actor: { name: string; avatarUrl?: string }
  /** "Tharsi added an internal note". */
  title: string
  /** Second line: a quote, "Medium → Urgent", "3 min 12 s · recorded". */
  detail?: string
  /** ISO timestamp. */
  at: string
}

/** One message in the Conversation tab. */
export interface TicketMessage {
  id: string
  author: { name: string; avatarUrl?: string }
  /** customer — from the requester · agent — a reply · note — internal, agents only. */
  from: 'customer' | 'agent' | 'note'
  /** How it arrived, e.g. "Email", "Voicemail · 0:48". */
  via?: string
  body: string
  /** Files sent with a reply. */
  attachments?: { name: string; size: number }[]
  at: string
}

export type TicketAttachmentKind = 'image' | 'audio' | 'document' | 'file'

export interface TicketAttachment {
  id: string
  name: string
  kind: TicketAttachmentKind
  /** Bytes. */
  size: number
  /** "from Dennis", "from RingCentral", "added by Tharsi". */
  source: string
}

/** The email that opened the ticket (Figma T1 · Original email). */
export interface TicketEmail {
  from: string
  to: string
  /** ISO timestamp. */
  date: string
  subject: string
  /** Paragraphs. */
  body: string[]
  /** Earlier thread, hidden behind "Show quoted text". */
  quoted?: string[]
  attachmentIds: string[]
}

/** Everything the ticket detail page shows beyond the list row. */
export interface TicketDetail {
  /** "Phone · via Zendesk #3690273". */
  source: string
  application: string
  messages: TicketMessage[]
  activity: TicketActivity[]
  email?: TicketEmail
  attachments: TicketAttachment[]
  asset?: string
  invoice?: string
  similar: { id: number; subject: string; status: TicketStatus; timeLabel: string }[]
  /** Set once resolved / closed (Figma X9 banner). */
  resolution?: {
    by: string
    /** ISO timestamp. */
    at: string
    /** Satisfaction score out of 5, when the survey came back. */
    csat?: number
  }
  /** Knowledge note the fix can be linked to when resolving (Figma X8). */
  knowledgeNote?: string
  customer: {
    tag?: string
    tickets: number
    open: number
    /** ISO date. */
    since: string
  }
}

/** "412 KB", "1.2 MB". */
export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
