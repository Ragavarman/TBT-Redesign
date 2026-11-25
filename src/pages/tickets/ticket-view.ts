import type { IconName } from '@/components/atoms'
import { WS_NOW, wsAgents, wsCurrentAgent } from '@/mocks'
import {
  SLA_STATE_LABEL,
  SLA_STATES,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUSES,
  type Ticket,
} from '@/types'
import { STATUS_PICKER_LABEL } from '@/components/organisms'

/**
 * How a ticket list is narrowed, ordered, grouped and shown (Figma Interface · X3 Filter builder,
 * X4 Display options, T6 Save view). Pure data + functions; the popovers edit these shapes.
 */

/* ── Filters ───────────────────────────────────────────────────────────────────────── */

export type FilterField = 'status' | 'priority' | 'assignee' | 'channel' | 'sla' | 'created'
export type FilterOp = 'any' | 'none'

export interface FilterCondition {
  id: string
  field: FilterField
  op: FilterOp
  values: string[]
}

export interface FilterFieldDef {
  id: FilterField
  label: string
  icon: IconName
  ops: { value: FilterOp; label: string }[]
  options: { value: string; label: string }[]
}

const IS = [
  { value: 'any' as const, label: 'is any of' },
  { value: 'none' as const, label: 'is none of' },
]

export const FILTER_FIELDS: FilterFieldDef[] = [
  {
    id: 'status',
    label: 'Status',
    icon: 'layers',
    ops: IS,
    options: TICKET_STATUSES.map((s) => ({ value: s, label: STATUS_PICKER_LABEL[s] })),
  },
  {
    id: 'priority',
    label: 'Priority',
    icon: 'reports',
    ops: IS,
    options: [...TICKET_PRIORITIES]
      .reverse()
      .map((p) => ({ value: p, label: TICKET_PRIORITY_LABEL[p] })),
  },
  {
    id: 'assignee',
    label: 'Assignee',
    icon: 'user',
    ops: IS,
    options: [
      { value: 'me', label: 'Me' },
      ...Object.values(wsAgents)
        .filter((a) => a.id !== wsCurrentAgent.id)
        .map((a) => ({ value: a.id, label: a.name })),
      { value: 'none', label: 'Unassigned' },
    ],
  },
  {
    id: 'channel',
    label: 'Channel',
    icon: 'mail',
    ops: IS,
    options: [
      { value: 'email', label: 'Email' },
      { value: 'phone', label: 'Phone' },
      { value: 'chat', label: 'Chat' },
      { value: 'portal', label: 'Portal' },
    ],
  },
  {
    id: 'sla',
    label: 'SLA',
    icon: 'clock',
    ops: IS,
    options: SLA_STATES.map((s) => ({ value: s, label: SLA_STATE_LABEL[s] })),
  },
  {
    id: 'created',
    label: 'Created',
    icon: 'calendar',
    ops: [{ value: 'any', label: 'in the last' }],
    options: [
      { value: '1', label: '24 hours' },
      { value: '7', label: '7 days' },
      { value: '30', label: '30 days' },
    ],
  },
]

export const fieldDef = (f: FilterField) => FILTER_FIELDS.find((d) => d.id === f)!

const valueOf = (t: Ticket, f: FilterField): string | undefined => {
  switch (f) {
    case 'status':
      return t.status
    case 'priority':
      return t.priority
    case 'assignee':
      return !t.assignee ? 'none' : t.assignee.id === wsCurrentAgent.id ? 'me' : t.assignee.id
    case 'channel':
      return t.channel
    case 'sla':
      return t.sla?.state
    case 'created':
      return undefined
  }
}

function matches(t: Ticket, c: FilterCondition) {
  if (c.values.length === 0) return true // half-built row: ignore
  if (c.field === 'created') {
    const days = Math.max(...c.values.map(Number))
    return Date.parse(WS_NOW) - Date.parse(t.createdAt) <= days * 86_400_000
  }
  const v = valueOf(t, c.field)
  const hit = v !== undefined && c.values.includes(v)
  return c.op === 'any' ? hit : !hit
}

export const applyFilters = (tickets: Ticket[], conditions: FilterCondition[]) =>
  tickets.filter((t) => conditions.every((c) => matches(t, c)))

export const activeFilters = (conditions: FilterCondition[]) =>
  conditions.filter((c) => c.values.length > 0)

/** "Status is Open, Investigating" — for chips and the Save view summary. */
export function describeCondition(c: FilterCondition) {
  const def = fieldDef(c.field)
  const op = def.ops.find((o) => o.value === c.op)?.label ?? ''
  const values = c.values.map((v) => def.options.find((o) => o.value === v)?.label ?? v)
  const verb = op === 'is any of' ? 'is' : op
  return `${def.label} ${verb} ${values.join(', ')}`
}

let seq = 0
export const newCondition = (field: FilterField): FilterCondition => ({
  id: `f${++seq}`,
  field,
  op: fieldDef(field).ops[0]!.value,
  values: [],
})

/* ── Display ───────────────────────────────────────────────────────────────────────── */

export type Grouping = 'status' | 'priority' | 'assignee' | 'none'
export type Ordering = 'updated' | 'created' | 'priority' | 'sla'
export type Density = 'comfortable' | 'compact'
export type RowProp = 'id' | 'customer' | 'priority' | 'sla' | 'assignee' | 'labels' | 'updated'

export interface DisplayOptions {
  grouping: Grouping
  ordering: Ordering
  density: Density
  showEmptyGroups: boolean
  props: RowProp[]
}

export const DEFAULT_DISPLAY: DisplayOptions = {
  grouping: 'status',
  ordering: 'updated',
  density: 'comfortable',
  showEmptyGroups: false,
  props: ['id', 'customer', 'priority', 'sla', 'assignee', 'updated'],
}

export const GROUPINGS = [
  { value: 'status', label: 'Status' },
  { value: 'priority', label: 'Priority' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'none', label: 'No grouping' },
]

export const ORDERINGS = [
  { value: 'updated', label: 'Updated · newest' },
  { value: 'created', label: 'Created · newest' },
  { value: 'priority', label: 'Priority · highest' },
  { value: 'sla', label: 'SLA due · soonest' },
]

export const DENSITIES = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
]

export const ROW_PROPS: { value: RowProp; label: string }[] = [
  { value: 'id', label: 'ID' },
  { value: 'customer', label: 'Customer' },
  { value: 'priority', label: 'Priority' },
  { value: 'sla', label: 'SLA' },
  { value: 'assignee', label: 'Assignee' },
  { value: 'labels', label: 'Labels' },
  { value: 'updated', label: 'Updated' },
]

const PRIORITY_RANK = (t: Ticket) => TICKET_PRIORITIES.indexOf(t.priority)
const SLA_RANK = (t: Ticket) =>
  t.sla ? { breached: 0, 'at-risk': 1, 'on-track': 2 }[t.sla.state] : 3

export function orderTickets(tickets: Ticket[], ordering: Ordering) {
  const list = [...tickets]
  const by = {
    updated: (a: Ticket, b: Ticket) => b.updatedAt.localeCompare(a.updatedAt),
    created: (a: Ticket, b: Ticket) => b.createdAt.localeCompare(a.createdAt),
    priority: (a: Ticket, b: Ticket) => PRIORITY_RANK(b) - PRIORITY_RANK(a),
    sla: (a: Ticket, b: Ticket) => SLA_RANK(a) - SLA_RANK(b),
  }[ordering]
  return list.sort((a, b) => by(a, b) || b.updatedAt.localeCompare(a.updatedAt))
}

export interface TicketGroup {
  id: string
  label: string
  /** status / priority value for the header glyph. */
  status?: Ticket['status']
  priority?: Ticket['priority']
  tickets: Ticket[]
}

/** Group already-ordered tickets. Status grouping pins "Breached SLA" first (Figma X3). */
export function groupTickets(tickets: Ticket[], d: DisplayOptions): TicketGroup[] {
  if (d.grouping === 'none') return [{ id: 'all', label: 'All', tickets }]
  if (d.grouping === 'status') {
    const breached = tickets.filter((t) => t.sla?.state === 'breached')
    const rest = tickets.filter((t) => t.sla?.state !== 'breached')
    const groups: TicketGroup[] = TICKET_STATUSES.map((s) => ({
      id: s,
      label: STATUS_PICKER_LABEL[s],
      status: s,
      tickets: rest.filter((t) => t.status === s),
    }))
    if (breached.length)
      groups.unshift({ id: 'breached', label: 'Breached SLA', status: 'open', tickets: breached })
    return groups.filter((g) => d.showEmptyGroups || g.tickets.length > 0)
  }
  if (d.grouping === 'priority') {
    return [...TICKET_PRIORITIES]
      .reverse()
      .map((p) => ({
        id: p,
        label: TICKET_PRIORITY_LABEL[p],
        priority: p,
        tickets: tickets.filter((t) => t.priority === p),
      }))
      .filter((g) => d.showEmptyGroups || g.tickets.length > 0)
  }
  const people = [
    ...Object.values(wsAgents).map((a) => ({ id: a.id, label: a.name })),
    { id: 'none', label: 'Unassigned' },
  ]
  return people
    .map((p) => ({
      id: p.id,
      label: p.label,
      tickets: tickets.filter((t) => (t.assignee?.id ?? 'none') === p.id),
    }))
    .filter((g) => d.showEmptyGroups || g.tickets.length > 0)
}

/* ── Saved views ───────────────────────────────────────────────────────────────────── */

export type ViewVisibility = 'me' | 'team' | 'everyone'

export interface SavedView {
  id: string
  name: string
  filters: FilterCondition[]
  display: DisplayOptions
  visibility: ViewVisibility
  favorite: boolean
}

/** One ticket edit — bulk actions send these, and their previous values to undo. */
export interface TicketChange {
  id: number
  patch: Partial<Ticket>
}
