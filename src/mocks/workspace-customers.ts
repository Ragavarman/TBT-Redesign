import type { Customer, CustomerAsset, CustomerProfile } from '@/types'
import { WS_NOW, wsAgents, wsCustomers } from './workspace'

/**
 * Customer profiles for the workspace (Figma Interface · Customers section). Dennis carries the
 * Figma data; everyone else gets a short generated profile.
 */

const at = (date: string, time = '09:00') => `${date}T${time}:00Z`
const today = WS_NOW.slice(0, 10)

const dennis: CustomerProfile = {
  customerId: wsCustomers.dennis.id,
  company: 'Davenport & Co.',
  location: 'Colombo 03',
  since: '2026-11-04',
  source: 'Zendesk import',
  tags: ['VIP', 'Frequent caller'],
  notes: [
    {
      id: 'n1',
      author: wsAgents.tharsi,
      body: 'Prefers a phone call over email. Best time is before 4 PM.',
      at: at('2026-11-24', '15:10'),
      pinned: true,
    },
    {
      id: 'n2',
      author: wsAgents.arun,
      body: 'Has two printers at Colombo 03 — both on firmware v4.2.1.',
      at: at('2026-11-12', '10:30'),
    },
  ],
  assets: [
    {
      id: 'a1',
      name: 'Epson TM-T88VI receipt printer',
      serial: 'X5K0012345',
      location: 'Colombo 03',
      condition: 'needs-repair',
      warrantyUntil: '2027-03',
    },
    {
      id: 'a2',
      name: 'Verifone V200c card reader',
      serial: 'VF-200-88341',
      location: 'Colombo 03',
      condition: 'good',
      warrantyUntil: '2026-08',
    },
  ],
  calls: [
    {
      id: 'k1',
      at: at(today, '08:37'),
      type: 'voicemail',
      duration: 42,
      recording: true,
      ticketId: 222,
    },
    { id: 'k2', at: at(today, '08:12'), type: 'missed', ticketId: 222 },
    {
      id: 'k3',
      at: at('2026-11-18', '16:05'),
      type: 'answered',
      agent: 'Team Lead',
      duration: 192,
      recording: true,
      ticketId: 188,
    },
    {
      id: 'k4',
      at: at('2026-11-04', '11:20'),
      type: 'answered',
      agent: 'Tharsi K.',
      duration: 408,
      recording: true,
      ticketId: 188,
    },
    {
      id: 'k5',
      at: at('2026-10-29', '09:02'),
      type: 'voicemail',
      duration: 31,
      recording: true,
      ticketId: 171,
    },
  ],
  stats: { lastContact: '12m ago · phone', avgResolution: '6h 10m', csat: 5 },
}

const PROFILES = new Map<string, CustomerProfile>([[dennis.customerId, dennis]])

/** A plausible profile for any customer without hand-written data. */
function generated(c: Customer, i: number): CustomerProfile {
  return {
    customerId: c.id,
    company: c.organization || undefined,
    location: ['Colombo 07', 'Kandy', 'Galle', 'Negombo'][i % 4],
    since: ['2025-06-12', '2024-11-02', '2026-02-19', '2025-09-30'][i % 4]!,
    source: ['Zendesk import', 'Portal sign-up', 'Phone'][i % 3]!,
    tags: c.vip ? ['VIP'] : i % 3 === 0 ? ['Frequent caller'] : [],
    notes: [],
    assets: [],
    calls: [],
    stats: {
      lastContact: ['2h ago · email', '1d ago · chat', '3d ago · phone'][i % 3]!,
      avgResolution: ['4h 20m', '1d 2h', '9h 05m'][i % 3]!,
    },
    needsReview: i % 2 === 1,
  }
}

/** Every workspace customer, in a stable order. */
export const wsCustomerList: Customer[] = Object.values(wsCustomers)

export function wsCustomerProfile(id: string): CustomerProfile | undefined {
  const known = PROFILES.get(id)
  if (known) return known
  const i = wsCustomerList.findIndex((c) => c.id === id)
  return i === -1 ? undefined : generated(wsCustomerList[i]!, i)
}

/** Devices in stock that can be linked to a customer (Assets tab → Link asset). */
export const wsInventory: CustomerAsset[] = [
  {
    id: 'i1',
    name: 'Epson TM-m30III receipt printer',
    serial: 'X9M0045102',
    location: 'Warehouse',
    condition: 'good',
    warrantyUntil: '2028-01',
  },
  {
    id: 'i2',
    name: 'Ingenico Move/5000 card reader',
    serial: 'IN-5000-11290',
    location: 'Warehouse',
    condition: 'good',
    warrantyUntil: '2027-11',
  },
  {
    id: 'i3',
    name: 'Zebra DS2208 barcode scanner',
    serial: 'ZB-2208-7741',
    location: 'Colombo 07',
    condition: 'good',
    warrantyUntil: '2027-05',
  },
  {
    id: 'i4',
    name: 'Star mC-Print3 receipt printer',
    serial: 'ST-MC3-0098',
    location: 'Kandy',
    condition: 'needs-repair',
    warrantyUntil: '2026-12',
  },
]

/* ── Tags (Figma C5) ───────────────────────────────────────────────────────────────── */

export type TagStyle = 'outline' | 'filled' | 'dot'

export interface CustomerTagDef {
  id: string
  name: string
  description: string
  style: TagStyle
  /** Agents see it in the ticket's customer card. */
  showOnTickets: boolean
  /** Added by a rule, described here. */
  autoRule?: string
}

export const wsTagDefs: CustomerTagDef[] = [
  {
    id: 'tg1',
    name: 'VIP',
    description: 'Key accounts — answer first',
    style: 'filled',
    showOnTickets: true,
  },
  {
    id: 'tg2',
    name: 'Frequent caller',
    description: 'Called 3+ times in the last 30 days',
    style: 'outline',
    showOnTickets: true,
    autoRule: 'Tag callers with 3+ calls in 30 days',
  },
  {
    id: 'tg3',
    name: 'Wholesale',
    description: 'Buys for several stores',
    style: 'outline',
    showOnTickets: true,
  },
  {
    id: 'tg4',
    name: 'Needs callback',
    description: 'Asked us to call back',
    style: 'dot',
    showOnTickets: true,
  },
  {
    id: 'tg5',
    name: 'Zendesk import',
    description: 'Brought over from Zendesk',
    style: 'outline',
    showOnTickets: false,
  },
  {
    id: 'tg6',
    name: 'Pharmacy',
    description: 'Regulated stock — check licence',
    style: 'outline',
    showOnTickets: true,
  },
]

/* ── Possible duplicates (Figma C4) ────────────────────────────────────────────────── */

/** A second record that looks like an existing customer (matched by phone). */
export interface DuplicateRecord {
  name: string
  phone?: string
  email?: string
  company?: string
  tags: string[]
  tickets: number
  /** ISO date. */
  created: string
  /** "Zendesk #3690273". */
  externalId: string
}

export interface DuplicateGroup {
  id: string
  /** Record A — the customer already in TBT. */
  customerId: string
  /** Record B — the imported look-alike. */
  other: DuplicateRecord
}

export const wsDuplicates: DuplicateGroup[] = [
  {
    id: 'd1',
    customerId: wsCustomers.dennis.id,
    other: {
      name: 'Dennis Davenport',
      phone: '(909) 802-3652',
      email: 'dennis@davenport.co',
      tags: ['Zendesk import'],
      tickets: 1,
      created: '2025-03-02',
      externalId: 'Zendesk #3690273',
    },
  },
  {
    id: 'd2',
    customerId: wsCustomers.acme.id,
    other: {
      name: 'Priya Nair',
      phone: '(011) 245-0199',
      email: 'priya.nair@acmecorp.example',
      company: 'Acme Corporation',
      tags: ['Zendesk import', 'Wholesale'],
      tickets: 2,
      created: '2024-08-14',
      externalId: 'Zendesk #3581120',
    },
  },
  {
    id: 'd3',
    customerId: wsCustomers.kandy.id,
    other: {
      name: 'Shanthi Rajan',
      phone: '(081) 341-2290',
      company: 'Kandy Foods Ltd',
      tags: ['Zendesk import'],
      tickets: 1,
      created: '2025-01-21',
      externalId: 'Zendesk #3611874',
    },
  },
  {
    id: 'd4',
    customerId: wsCustomers.lanka.id,
    other: {
      name: 'Asha Perera',
      phone: '(011) 555-0148',
      email: 'asha@lankapharma.example',
      company: 'Lanka Pharma',
      tags: ['Zendesk import', 'Pharmacy'],
      tickets: 3,
      created: '2024-12-09',
      externalId: 'Zendesk #3598001',
    },
  },
]

/* ── Companies (Figma X15) ─────────────────────────────────────────────────────────── */

export interface CompanyRecord {
  name: string
  domain: string
  /** Contacts on file (the mock only has one each in wsCustomers). */
  people: number
  /** Products they use, shown as chips. */
  applications: string[]
  /** "12m", "1h", "2w". */
  lastContact: string
}

export const wsCompanies: CompanyRecord[] = [
  {
    name: 'Davenport & Co.',
    domain: 'davenport.co',
    people: 12,
    applications: [],
    lastContact: '12m',
  },
  {
    name: 'Acme Corp',
    domain: 'acme.lk',
    people: 48,
    applications: ['Customer Portal', 'POS'],
    lastContact: '1h',
  },
  {
    name: 'Northwind',
    domain: 'northwind.lk',
    people: 31,
    applications: ['POS'],
    lastContact: '4m',
  },
  {
    name: 'Ceylon Mart',
    domain: 'ceylonmart.lk',
    people: 27,
    applications: ['Inventory'],
    lastContact: '1h',
  },
  { name: 'Kandy Foods', domain: 'kandyfoods.lk', people: 19, applications: [], lastContact: '1d' },
  {
    name: 'Lanka Pharma',
    domain: 'lankapharma.lk',
    people: 14,
    applications: ['Payments'],
    lastContact: '2d',
  },
  { name: 'Galle HW', domain: 'gallehw.lk', people: 6, applications: [], lastContact: '6d' },
  {
    name: 'Bluefin',
    domain: 'bluefin.lk',
    people: 9,
    applications: ['Customer Portal'],
    lastContact: '1h',
  },
  {
    name: 'Jaffna Textiles',
    domain: 'jaffnatex.lk',
    people: 9,
    applications: [],
    lastContact: '2w',
  },
]
