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
