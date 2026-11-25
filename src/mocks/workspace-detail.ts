import type { Ticket, TicketChannel, TicketDetail } from '@/types'
import { wsAgents, wsCustomers, wsTickets } from './workspace'

/**
 * Ticket detail data for the workspace (Figma Interface · T1 Original email, T2 Attachments,
 * T3 Full timeline). T-222 carries the full Figma thread; every other ticket gets a short
 * generated one so any row in the table opens.
 */

const SOURCE: Record<TicketChannel, string> = {
  email: 'Email · via Zendesk',
  phone: 'Phone · via RingCentral',
  chat: 'Chat · via Website',
  portal: 'Portal · Customer Portal',
}

const dennis = wsCustomers.dennis
const tharsi = wsAgents.tharsi

const t222: TicketDetail = {
  source: 'Phone · via Zendesk #3690273',
  application: 'Customer Portal',
  messages: [
    {
      id: 'm1',
      author: dennis,
      from: 'customer',
      via: 'Email',
      body: 'Hi TBT Support, I left a voicemail this morning about our receipt printer. Since the update on Monday it shows “Offline” in the POS, and restarting it didn’t help. Could someone call me back on (909) 802-3652 before 4 PM?',
      at: '2026-11-18T09:42:00Z',
    },
    {
      id: 'm2',
      author: tharsi,
      from: 'agent',
      via: 'Email',
      body: 'Thanks Dennis — we’re checking the printer status from our side now and will call you back before 4 PM.',
      at: '2026-11-24T11:05:00Z',
    },
    {
      id: 'm3',
      author: dennis,
      from: 'customer',
      via: 'Email',
      body: 'Any update on this?',
      at: '2026-11-24T16:20:00Z',
    },
    {
      id: 'm4',
      author: dennis,
      from: 'customer',
      via: 'Voicemail · 0:48',
      body: 'Hi, calling about the card reader at our front counter — the printer is still offline. Please call me back.',
      at: '2026-11-25T09:51:00Z',
    },
    {
      id: 'm5',
      author: tharsi,
      from: 'note',
      body: 'Asked Arun to check firmware.',
      at: '2026-11-25T10:05:00Z',
    },
  ],
  activity: [
    {
      id: 'a1',
      kind: 'note',
      actor: tharsi,
      title: 'Tharsi added an internal note',
      detail: '“Asked Arun to check firmware.”',
      at: '2026-11-25T10:05:00Z',
    },
    {
      id: 'a2',
      kind: 'status',
      actor: tharsi,
      title: 'Tharsi changed priority',
      detail: 'Low → Medium',
      at: '2026-11-25T09:58:00Z',
    },
    {
      id: 'a3',
      kind: 'call',
      actor: { name: 'RingCentral' },
      title: 'Call from (909) 802-3652',
      detail: '3 min 12 s · recorded',
      at: '2026-11-25T09:51:00Z',
    },
    {
      id: 'a4',
      kind: 'message',
      actor: dennis,
      title: 'Dennis replied by email',
      detail: '“Any update on this?”',
      at: '2026-11-24T16:20:00Z',
    },
    {
      id: 'a5',
      kind: 'message',
      actor: tharsi,
      title: 'Tharsi replied by email',
      detail: '“Thanks Dennis — we’re checking the printer status…”',
      at: '2026-11-24T11:05:00Z',
    },
    {
      id: 'a6',
      kind: 'status',
      actor: { name: 'System' },
      title: 'Auto-assigned by routing rule',
      detail: 'Application: POS → Support Team Alpha',
      at: '2026-11-24T10:30:00Z',
    },
    {
      id: 'a7',
      kind: 'message',
      actor: dennis,
      title: 'Ticket created from email',
      detail: 'support@tbt.lk',
      at: '2026-11-18T09:42:00Z',
    },
  ],
  email: {
    from: `${dennis.name} <${dennis.email}>`,
    to: 'support@tbt.lk',
    date: '2026-11-18T09:42:00Z',
    subject: 'Voice message from (909) 802-3652',
    body: [
      'Hi TBT Support,',
      'I left a voicemail this morning about our receipt printer. Since the update on Monday it shows “Offline” in the POS, and restarting it didn’t help.',
      'Could someone call me back on (909) 802-3652 before 4 PM?',
      'Thanks,\nDennis',
    ],
    quoted: [
      'On Mon, Nov 16, 2026, TBT Support <support@tbt.lk> wrote:',
      '> Your POS update has been scheduled for Monday morning.',
    ],
    attachmentIds: ['f2', 'f1'],
  },
  attachments: [
    {
      id: 'f1',
      name: 'printer-error.jpg',
      kind: 'image',
      size: 1.2 * 1024 * 1024,
      source: 'from Dennis',
    },
    {
      id: 'f2',
      name: 'voicemail.mp3',
      kind: 'audio',
      size: 412 * 1024,
      source: 'from RingCentral',
    },
    {
      id: 'f3',
      name: 'invoice-INV-1043.pdf',
      kind: 'document',
      size: 220 * 1024,
      source: 'added by Tharsi',
    },
    {
      id: 'f4',
      name: 'pos-logs.txt',
      kind: 'file',
      size: 1.3 * 1024 * 1024,
      source: 'added by Arun',
    },
  ],
  similar: [
    { id: 188, subject: 'Call from (909) 802-3652', status: 'closed', timeLabel: 'Nov 4' },
    { id: 171, subject: 'Receipt printer shows offline', status: 'resolved', timeLabel: 'Oct 28' },
  ],
  customer: { tag: 'Frequent caller', tickets: 3, open: 2, since: '2026-11-04' },
}

/** A short, believable thread for tickets without hand-written detail. */
function generated(t: Ticket): TicketDetail {
  const created = {
    id: `${t.id}-a2`,
    kind: 'message' as const,
    actor: t.requester,
    title: t.channel === 'email' ? 'Ticket created from email' : 'Ticket created',
    detail: t.channel === 'email' ? 'support@tbt.lk' : SOURCE[t.channel],
    at: t.createdAt,
  }
  const assigned = t.assignee && {
    id: `${t.id}-a1`,
    kind: 'status' as const,
    actor: { name: 'System' },
    title: 'Auto-assigned by routing rule',
    detail: `${t.team} → ${t.assignee.name}`,
    at: new Date(Date.parse(t.createdAt) + 5 * 60_000).toISOString(),
  }
  return {
    source: SOURCE[t.channel],
    application: 'Customer Portal',
    messages: [
      {
        id: `${t.id}-m1`,
        author: t.requester,
        from: 'customer',
        via: SOURCE[t.channel].split(' · ')[0],
        body: t.preview,
        at: t.createdAt,
      },
    ],
    activity: assigned ? [assigned, created] : [created],
    email:
      t.channel === 'email'
        ? {
            from: `${t.requester.name} <${t.requester.email}>`,
            to: 'support@tbt.lk',
            date: t.createdAt,
            subject: t.subject,
            body: ['Hi TBT Support,', t.preview, `Thanks,\n${t.requester.name}`],
            attachmentIds: [],
          }
        : undefined,
    attachments: [],
    similar: [],
    customer: {
      tickets: t.requester.openTickets + 1,
      open: t.requester.openTickets,
      since: '2025-06-12',
    },
  }
}

const DETAILS = new Map<number, TicketDetail>([[222, t222]])

/** Detail for any workspace ticket. */
export function wsTicketDetail(id: number): TicketDetail | undefined {
  const known = DETAILS.get(id)
  if (known) return known
  const ticket = wsTickets.find((t) => t.id === id)
  return ticket && generated(ticket)
}
