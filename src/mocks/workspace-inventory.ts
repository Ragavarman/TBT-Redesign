import type { AssetCondition } from '@/types'

/** Inventory section data (Figma Interface · 07, 07a/b, I2–I10). */

export interface InventoryItem {
  id: string
  name: string
  model: string
  brand: string
  category: string
  serial: string
  location: string
  condition: AssetCondition
  /** Workspace customer id (who owns or uses it). */
  customerId?: string
  /** Shown when there is no customer (e.g. a front desk). */
  assignedTo?: string
  /** "YYYY-MM-DD". */
  purchased: string
  /** "YYYY-MM-DD". */
  warrantyUntil: string
  history: { when: string; text: string }[]
}

const item = (
  id: string,
  name: string,
  model: string,
  brand: string,
  category: string,
  serial: string,
  location: string,
  condition: AssetCondition,
  extra: Partial<InventoryItem> = {},
): InventoryItem => ({
  id,
  name,
  model,
  brand,
  category,
  serial,
  location,
  condition,
  purchased: '2025-03-12',
  warrantyUntil: '2027-03-12',
  history: [{ when: 'Mar 12, 2025', text: 'Added by Tharsi K.' }],
  ...extra,
})

export const wsInventoryItems: InventoryItem[] = [
  item(
    'it1',
    'Epson TM-T88VI receipt printer',
    'TM-T88VI',
    'Epson',
    'Printers',
    'X5K0012345',
    'Colombo 03',
    'needs-repair',
    {
      customerId: 'w-c1',
      purchased: '2024-03-12',
      warrantyUntil: '2027-03-12',
      history: [
        { when: 'Today', text: 'Condition changed to Needs repair by Arun M.' },
        { when: 'Nov 18', text: 'Firmware updated to v4.2.1' },
        { when: 'Mar 12, 2024', text: 'Added by Tharsi K.' },
      ],
    },
  ),
  item(
    'it2',
    'Verifone V200c card reader',
    'V200c',
    'Verifone',
    'Card readers',
    'VF-200-88341',
    'Colombo 03',
    'good',
    { customerId: 'w-c1', warrantyUntil: '2026-08-01' },
  ),
  item(
    'it3',
    'Front desk laptop',
    'Latitude 5440',
    'Dell',
    'Laptops',
    'ZHX2K93',
    'Clinic A',
    'good',
    { assignedTo: 'Wireless caller' },
  ),
  item(
    'it4',
    'Receipt printer',
    'TM-m30III',
    'Epson',
    'Printers',
    'X9M0045102',
    'Kandy',
    'needs-repair',
    { customerId: 'w-c5' },
  ),
  item(
    'it5',
    'Reception desktop',
    'ProDesk 400',
    'HP',
    'Desktops',
    'CZC4412KX',
    'Colombo 03',
    'good',
    { assignedTo: 'Kalindu Yapa' },
  ),
  item('it6', 'Wi-Fi router', 'RV340', 'Cisco', 'Network', 'FOC2231X0', 'Main office', 'good'),
  item(
    'it7',
    'Card reader',
    'Move/5000',
    'Ingenico',
    'Card readers',
    'IN-5000-11290',
    'Galle',
    'retired',
    { customerId: 'w-c8' },
  ),
  item('it8', 'Barcode scanner', 'DS2208', 'Zebra', 'Scanners', 'ZB-2208-7741', 'Jaffna', 'good', {
    customerId: 'w-c6',
  }),
  item('it9', 'Label printer', 'ZD421', 'Zebra', 'Printers', 'ZB-421-0093', 'Colombo 03', 'good', {
    customerId: 'w-c2',
  }),
  item(
    'it10',
    'Kitchen printer',
    'mC-Print3',
    'Star Micronics',
    'Printers',
    'ST-MC3-0098',
    'Kandy',
    'good',
    { customerId: 'w-c6' },
  ),
  item(
    'it11',
    'Back office card reader',
    'V200c',
    'Verifone',
    'Card readers',
    'VF-200-90112',
    'Jaffna',
    'retired',
  ),
  item('it12', 'Handheld scanner', 'DS2278', 'Zebra', 'Scanners', 'ZB-2278-3310', 'Galle', 'good', {
    customerId: 'w-c4',
  }),
]

export interface InventoryBrand {
  id: string
  name: string
  categories: string[]
  website: string
  supportPhone: string
  updated: string
}

export const wsBrands: InventoryBrand[] = [
  {
    id: 'b1',
    name: 'Epson',
    categories: ['Printers'],
    website: 'epson.com',
    supportPhone: '+94 11 230 0000',
    updated: '2d ago',
  },
  {
    id: 'b2',
    name: 'Verifone',
    categories: ['Card readers'],
    website: 'verifone.com',
    supportPhone: '',
    updated: 'Nov 12',
  },
  {
    id: 'b3',
    name: 'Zebra',
    categories: ['Scanners', 'Printers'],
    website: 'zebra.com',
    supportPhone: '',
    updated: 'Nov 9',
  },
  {
    id: 'b4',
    name: 'Star Micronics',
    categories: ['Printers'],
    website: 'starmicronics.com',
    supportPhone: '',
    updated: 'Nov 2',
  },
  {
    id: 'b5',
    name: 'Ingenico',
    categories: ['Card readers'],
    website: 'ingenico.com',
    supportPhone: '',
    updated: 'Oct 21',
  },
  {
    id: 'b6',
    name: 'HP',
    categories: ['Desktops', 'Printers'],
    website: 'hp.com',
    supportPhone: '',
    updated: 'Oct 3',
  },
]

export interface InventoryCategory {
  id: string
  name: string
  description: string
  /** Warranty reminder, months before it ends. */
  reminderMonths: number
}

export const wsCategories: InventoryCategory[] = [
  {
    id: 'c1',
    name: 'Printers',
    description: 'Receipt, label and kitchen printers',
    reminderMonths: 2,
  },
  {
    id: 'c2',
    name: 'Card readers',
    description: 'Payment terminals and PIN pads',
    reminderMonths: 3,
  },
  { id: 'c3', name: 'Scanners', description: 'Barcode and handheld scanners', reminderMonths: 1 },
  { id: 'c4', name: 'Laptops', description: 'Staff laptops', reminderMonths: 2 },
  { id: 'c5', name: 'Desktops', description: 'Front desk and back office PCs', reminderMonths: 2 },
  {
    id: 'c6',
    name: 'Network',
    description: 'Routers, switches and access points',
    reminderMonths: 1,
  },
]

export interface InventoryLocation {
  id: string
  name: string
  address: string
  contact: string
}

export const wsLocations: InventoryLocation[] = [
  { id: 'l1', name: 'Colombo 03', address: '42 Galle Rd, Colombo 03', contact: 'Tharsi K.' },
  { id: 'l2', name: 'Kandy', address: '18 Peradeniya Rd, Kandy', contact: 'Nimal P.' },
  { id: 'l3', name: 'Jaffna', address: '7 Hospital Rd, Jaffna', contact: 'Arun M.' },
  { id: 'l4', name: 'Galle', address: '3 Church St, Galle Fort', contact: 'Dilini F.' },
  { id: 'l5', name: 'Clinic A', address: '12 Ward Pl, Colombo 07', contact: 'Kavya S.' },
  { id: 'l6', name: 'Main office', address: '1 Flower Rd, Colombo 07', contact: 'Team Lead' },
]

/** Sidebar condition views → condition. */
export const CONDITION_VIEW: Record<string, AssetCondition> = {
  good: 'good',
  repair: 'needs-repair',
  retired: 'retired',
}
