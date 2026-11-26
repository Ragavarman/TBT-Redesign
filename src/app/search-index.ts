import type { InventoryItem, KnowledgeNote } from '@/mocks'
import { formatTicketId, type Ticket, type TicketStatus } from '@/types'
import type { CustomerRecord } from './customers-context'
import { ticketPath } from './nav'

export const SEARCH_GROUPS = ['Tickets', 'Customers', 'Knowledge', 'Inventory'] as const
export type SearchGroup = (typeof SEARCH_GROUPS)[number]

export interface SearchHit {
  id: string
  group: SearchGroup
  title: string
  /** Second line: requester, phone, folder… */
  detail: string
  /** Right-hand meta: "Dennis Davenport · 3h", "VIP". */
  meta?: string
  /** A line of matching text. */
  snippet?: string
  status?: TicketStatus
  path: string
}

export interface SearchSources {
  tickets: Ticket[]
  records: CustomerRecord[]
  notes: KnowledgeNote[]
  items: InventoryItem[]
}

const words = (q: string) => q.toLowerCase().split(/\s+/).filter(Boolean)
const matches = (text: string, ws: string[]) => {
  const t = text.toLowerCase()
  return ws.every((w) => t.includes(w))
}
/** ~90 characters of `text` around the first word that matches. */
function snippetOf(text: string, ws: string[]) {
  const t = text.toLowerCase()
  const at = Math.min(...ws.map((w) => t.indexOf(w)).filter((i) => i >= 0))
  if (!Number.isFinite(at)) return undefined
  const start = Math.max(0, at - 30)
  return `${start ? '…' : ''}${text.slice(start, start + 90).replace(/\s+/g, ' ')}${start + 90 < text.length ? '…' : ''}`
}

/** Everything that matches every word of `q`, grouped in SEARCH_GROUPS order. */
export function searchAll(q: string, s: SearchSources): SearchHit[] {
  const ws = words(q)
  if (!ws.length) return []
  const hits: SearchHit[] = []
  for (const t of s.tickets) {
    const text = `${formatTicketId(t.id)} ${t.id} ${t.subject} ${t.preview} ${t.requester.name} ${t.requester.phone ?? ''} ${t.tags.join(' ')}`
    if (matches(text, ws))
      hits.push({
        id: `t${t.id}`,
        group: 'Tickets',
        title: `${formatTicketId(t.id)} ${t.subject}`,
        detail: t.requester.name,
        meta: t.requester.name,
        snippet: snippetOf(t.preview, ws),
        status: t.status,
        path: ticketPath('all', t.id),
      })
  }
  for (const { customer: c, profile: p } of s.records) {
    const text = `${c.name} ${c.email ?? ''} ${c.phone ?? ''} ${p.company} ${p.location} ${p.tags.join(' ')} ${p.assets.map((a) => a.name).join(' ')}`
    if (matches(text, ws))
      hits.push({
        id: `c${c.id}`,
        group: 'Customers',
        title: c.name,
        detail: [
          c.phone ?? c.email,
          p.assets.length ? `${p.assets.length} assets at ${p.location}` : p.location,
        ]
          .filter(Boolean)
          .join(' · '),
        meta: p.tags.includes('VIP') ? 'VIP' : p.company,
        path: `/customers/all/${c.id}`,
      })
  }
  for (const n of s.notes) {
    if (matches(`${n.title} ${n.folder} ${n.body}`, ws))
      hits.push({
        id: `n${n.id}`,
        group: 'Knowledge',
        title: n.title,
        detail: `Note · ${n.folder}`,
        meta: 'Note',
        snippet: snippetOf(n.body, ws),
        path: `/knowledge/notes/${n.id}`,
      })
  }
  for (const i of s.items) {
    if (matches(`${i.name} ${i.model} ${i.brand} ${i.serial} ${i.location} ${i.category}`, ws))
      hits.push({
        id: `i${i.id}`,
        group: 'Inventory',
        title: `${i.name} · ${i.serial}`,
        detail: `${i.category} · ${i.location}`,
        meta: 'Item',
        path: `/inventory/items/${i.id}`,
      })
  }
  return SEARCH_GROUPS.flatMap((g) => hits.filter((h) => h.group === g))
}

/** For no results (Figma H7): drop one word at a time and offer what still matches. */
export function didYouMean(q: string, s: SearchSources) {
  const ws = words(q)
  if (ws.length < 2) return []
  return ws
    .map((_, i) => ws.filter((__, j) => j !== i).join(' '))
    .map((alt) => ({ query: alt, count: searchAll(alt, s).length }))
    .filter((x) => x.count > 0)
    .slice(0, 3)
}
