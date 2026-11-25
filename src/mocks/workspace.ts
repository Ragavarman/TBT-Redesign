import type { Agent, Customer, Ticket } from '@/types'

/**
 * The "TBT Support" workspace exactly as the Figma Interface screens show it
 * (page 162:2 · Tickets section). Page stories use this set; component stories keep
 * the broader set in tickets.ts / people.ts.
 */

const agent = (id: string, name: string, role: Agent['role'] = 'agent'): Agent => ({
  id,
  name,
  email: `${name.split(' ')[0]!.toLowerCase()}@tbt.example`,
  role,
  team: 'Support Team Alpha',
  presence: 'online',
})

export const wsAgents = {
  teamLead: agent('w-tl', 'Team Lead', 'lead'),
  tharsi: agent('w-tk', 'Tharsi K.'),
  nimal: agent('w-np', 'Nimal P.'),
  dilini: agent('w-df', 'Dilini F.'),
  arun: agent('w-am', 'Arun M.'),
  kavya: agent('w-ks', 'Kavya S.'),
}

/** The signed-in agent (rail avatar "TL"). */
export const wsCurrentAgent = wsAgents.teamLead

const customer = (id: string, name: string, organization: string, openTickets = 1): Customer => ({
  id,
  name,
  email: `${name.split(' ')[0]!.toLowerCase()}@${(organization || 'caller').toLowerCase().replace(/\W+/g, '')}.example`,
  organization,
  openTickets,
})

export const wsCustomers = {
  dennis: { ...customer('w-c1', 'Dennis D.', '', 2), phone: '(909) 802-3652' },
  acme: customer('w-c2', 'Priya N.', 'Acme Corp', 3),
  bluefin: customer('w-c3', 'Ravi S.', 'Bluefin'),
  northwind: customer('w-c4', 'Dana W.', 'Northwind', 2),
  ceylon: customer('w-c5', 'Malik F.', 'Ceylon Mart'),
  kandy: customer('w-c6', 'Shanthi R.', 'Kandy Foods'),
  lanka: customer('w-c7', 'Asha P.', 'Lanka Pharma', 0),
  galle: customer('w-c8', 'Imran H.', 'Galle HW', 0),
}

/** Customer column text: the organisation, or the person for walk-in callers. */
export const customerLabel = (c: Customer) => c.organization || c.name

/** Fixed "now" for the workspace (Nov 25, 2026, 11:00). */
export const WS_NOW = '2026-11-25T11:00:00Z'
const minsAgo = (m: number) => new Date(Date.parse(WS_NOW) - m * 60_000).toISOString()

const t = (
  id: number,
  subject: string,
  rest: Omit<Ticket, 'id' | 'subject' | 'createdAt' | 'updatedAt' | 'team' | 'tags'> & {
    updatedMins: number
    tags?: string[]
  },
): Ticket => {
  const { updatedMins, tags = [], ...r } = rest
  return {
    id,
    subject,
    team: 'Support Team Alpha',
    tags,
    createdAt: minsAgo(updatedMins + 90),
    updatedAt: minsAgo(updatedMins),
    ...r,
  }
}

/** All tickets view, newest first (Figma 02 · Table view). */
export const wsTickets: Ticket[] = [
  t(222, 'Voice message from (909) 802-3652', {
    preview: 'Voicemail · 0:48 — “Hi, calling about the card reader at our…”',
    status: 'open',
    priority: 'medium',
    requester: wsCustomers.dennis,
    assignee: wsAgents.tharsi,
    channel: 'phone',
    tags: ['Voicemail'],
    sla: { state: 'on-track', label: 'First response in 1h 20m' },
    updatedMins: 5,
    unread: true,
    messageCount: 1,
  }),
  t(221, 'Printer offline after update', {
    preview: 'Since this morning’s firmware update the printer shows offline.',
    status: 'investigating',
    priority: 'high',
    requester: wsCustomers.acme,
    assignee: wsAgents.tharsi,
    channel: 'email',
    tags: ['Hardware'],
    sla: { state: 'at-risk', label: '18m left' },
    updatedMins: 12,
    unread: true,
    messageCount: 4,
  }),
  t(220, 'Refund for duplicate charge', {
    preview: 'We were charged twice for the November invoice.',
    status: 'waiting',
    priority: 'medium',
    requester: wsCustomers.bluefin,
    assignee: wsAgents.nimal,
    channel: 'email',
    tags: ['Billing'],
    updatedMins: 60,
    messageCount: 3,
  }),
  t(219, 'Card reader rejects tap payments', {
    preview: 'Contactless payments fail with error 05 at all tills.',
    status: 'open',
    priority: 'urgent',
    requester: wsCustomers.northwind,
    assignee: wsAgents.dilini,
    channel: 'phone',
    tags: ['Payments'],
    sla: { state: 'breached', label: 'Breached 12m ago' },
    updatedMins: 120,
    messageCount: 2,
  }),
  t(217, 'Sync delay between branches', {
    preview: 'Stock levels take 20+ minutes to sync from Kandy to Colombo.',
    status: 'investigating',
    priority: 'high',
    requester: wsCustomers.ceylon,
    assignee: wsAgents.arun,
    channel: 'portal',
    updatedMins: 180,
    messageCount: 6,
  }),
  t(214, 'Password reset email not received', {
    preview: 'Reset link never arrives; checked spam.',
    status: 'on-hold',
    priority: 'low',
    requester: wsCustomers.kandy,
    assignee: wsAgents.kavya,
    channel: 'email',
    updatedMins: 60 * 24,
    messageCount: 2,
  }),
  t(211, 'CSV export missing columns', {
    preview: 'The export no longer includes the SLA columns.',
    status: 'resolved',
    priority: 'low',
    requester: wsCustomers.lanka,
    assignee: wsAgents.nimal,
    channel: 'chat',
    updatedMins: 60 * 48,
    messageCount: 5,
  }),
  t(208, 'Replacement unit delivered', {
    preview: 'Courier confirmed delivery of the replacement terminal.',
    status: 'closed',
    priority: 'low',
    requester: wsCustomers.galle,
    assignee: wsAgents.arun,
    channel: 'email',
    updatedMins: 60 * 72,
    messageCount: 3,
  }),
]

/** View totals shown in the sidebar and page header (the full workspace, not just the rows above). */
export const wsCounts = { all: 67, mine: 8, mentions: 2, createdByMe: 4 }

/** "5m", "2h", "3d" — the compact form the table's Updated column uses. */
export function shortAgo(iso: string, now: string = WS_NOW): string {
  const m = Math.max(0, Math.round((Date.parse(now) - Date.parse(iso)) / 60_000))
  if (m < 60) return `${m}m`
  if (m < 60 * 24) return `${Math.floor(m / 60)}h`
  return `${Math.floor(m / (60 * 24))}d`
}
