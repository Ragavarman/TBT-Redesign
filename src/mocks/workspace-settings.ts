/** Settings section data (Figma Interface · S1–S13, X20–X22). */

export const TIME_ZONES = [
  'Asia/Colombo (GMT+5:30)',
  'Asia/Dubai (GMT+4)',
  'Europe/London (GMT+0)',
  'America/New_York (GMT−5)',
]
export const LANGUAGES = ['English', 'Sinhala', 'Tamil']

export interface ProfileSettings {
  firstName: string
  lastName: string
  displayName: string
  email: string
  language: string
  timeZone: string
  signature: string
}
export const wsProfile: ProfileSettings = {
  firstName: 'Team',
  lastName: 'Lead',
  displayName: 'Team L.',
  email: 'lead@tbt.lk',
  language: 'English',
  timeZone: TIME_ZONES[0]!,
  signature: 'Team L.\nTBT Support · +94 11 234 5678',
}

export interface SignedInDevice {
  id: string
  device: string
  location: string
  lastActive: string
  current?: boolean
}
export const wsDevices: SignedInDevice[] = [
  {
    id: 'd1',
    device: 'Chrome on Windows',
    location: 'Colombo, LK',
    lastActive: 'Now',
    current: true,
  },
  { id: 'd2', device: 'Safari on iPhone', location: 'Colombo, LK', lastActive: '2h ago' },
  { id: 'd3', device: 'Chrome on macOS', location: 'Kandy, LK', lastActive: '3d ago' },
]

export type NotifyChannel = 'inApp' | 'email' | 'desktop'
export interface NotificationEvent {
  id: string
  label: string
  inApp: boolean
  email: boolean
  desktop: boolean
}
export const wsNotificationEvents: NotificationEvent[] = [
  { id: 'assigned', label: 'A ticket is assigned to me', inApp: true, email: true, desktop: true },
  {
    id: 'mention',
    label: 'Someone mentions me in a note',
    inApp: true,
    email: true,
    desktop: true,
  },
  {
    id: 'reply',
    label: 'A customer replies to my ticket',
    inApp: true,
    email: false,
    desktop: true,
  },
  {
    id: 'risk',
    label: 'An SLA is at risk (30 min left)',
    inApp: true,
    email: false,
    desktop: true,
  },
  { id: 'breach', label: 'An SLA is breached', inApp: true, email: true, desktop: false },
  {
    id: 'new',
    label: 'A new ticket arrives in my team',
    inApp: false,
    email: false,
    desktop: false,
  },
  { id: 'call', label: 'I miss a call', inApp: true, email: false, desktop: true },
]

export interface BusinessDay {
  id: string
  day: string
  open: boolean
  from: string
  to: string
}
export interface GeneralSettings {
  workspaceName: string
  company: string
  prefix: string
  language: string
  timeZone: string
  hours: BusinessDay[]
}
export const wsGeneral: GeneralSettings = {
  workspaceName: 'TBT Support',
  company: 'MDI Solutions',
  prefix: 'T-',
  language: 'English',
  timeZone: TIME_ZONES[0]!,
  hours: [
    { id: 'wk', day: 'Monday – Friday', open: true, from: '8:30 AM', to: '5:30 PM' },
    { id: 'sat', day: 'Saturday', open: true, from: '9:00 AM', to: '1:00 PM' },
    { id: 'sun', day: 'Sunday', open: false, from: '9:00 AM', to: '1:00 PM' },
  ],
}
export const HOUR_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 ? '30' : '00'
  return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`
})

export interface Application {
  id: string
  name: string
  description: string
  defaultTeam: string
  slaPolicy: string
  channels: string[]
  supportEmail: string
  active: boolean
}
export const CHANNELS = ['Email', 'Chat', 'Phone', 'SMS', 'Portal']
export const wsApplications: Application[] = [
  {
    id: 'app1',
    name: 'Customer Portal',
    description: 'Customers submit and track tickets',
    defaultTeam: 'Support Team Alpha',
    slaPolicy: 'Standard',
    channels: ['Email', 'Chat', 'Phone'],
    supportEmail: 'portal@tbt.lk',
    active: true,
  },
  {
    id: 'app2',
    name: 'POS',
    description: 'Point of sale terminals and printers',
    defaultTeam: 'Technical Team Beta',
    slaPolicy: 'High',
    channels: ['Phone', 'Email'],
    supportEmail: 'pos@tbt.lk',
    active: true,
  },
  {
    id: 'app3',
    name: 'Inventory',
    description: 'Stock, warehouses and transfers',
    defaultTeam: 'Technical Team Beta',
    slaPolicy: 'Standard',
    channels: ['Email'],
    supportEmail: 'inventory@tbt.lk',
    active: true,
  },
  {
    id: 'app4',
    name: 'Payments',
    description: 'Billing, refunds and renewals',
    defaultTeam: 'Sales Team Gamma',
    slaPolicy: 'Standard',
    channels: ['Email', 'Phone'],
    supportEmail: 'billing@tbt.lk',
    active: false,
  },
]

export interface Organization {
  id: string
  name: string
  domain: string
  customers: number
  applications: string[]
}
export const wsOrganizations: Organization[] = [
  { id: 'org1', name: 'Davenport & Co.', domain: 'davenport.co', customers: 12, applications: [] },
  {
    id: 'org2',
    name: 'Acme Corp',
    domain: 'acme.lk',
    customers: 48,
    applications: ['Customer Portal', 'POS'],
  },
  { id: 'org3', name: 'Northwind Retail', domain: 'northwind.lk', customers: 31, applications: [] },
  {
    id: 'org4',
    name: 'Ceylon Mart',
    domain: 'ceylonmart.lk',
    customers: 27,
    applications: ['POS'],
  },
  { id: 'org5', name: 'Kandy Foods', domain: 'kandyfoods.lk', customers: 19, applications: [] },
  {
    id: 'org6',
    name: 'Lanka Pharma',
    domain: 'lankapharma.lk',
    customers: 14,
    applications: ['Inventory'],
  },
]

export interface TicketField {
  id: string
  name: string
  type: 'Dropdown' | 'Text' | 'Number' | 'Date & time' | 'Link to item' | 'Checkbox'
  required: boolean
  shownOn: string[]
}
export const FIELD_TYPES: TicketField['type'][] = [
  'Dropdown',
  'Text',
  'Number',
  'Date & time',
  'Link to item',
  'Checkbox',
]
export const wsTicketFields: TicketField[] = [
  {
    id: 'f1',
    name: 'Application',
    type: 'Dropdown',
    required: true,
    shownOn: ['New ticket', 'Details'],
  },
  { id: 'f2', name: 'Asset', type: 'Link to item', required: false, shownOn: ['Details'] },
  { id: 'f3', name: 'Invoice number', type: 'Text', required: false, shownOn: [] },
  { id: 'f4', name: 'Callback time', type: 'Date & time', required: false, shownOn: [] },
]

export interface ActionType {
  id: string
  name: string
  setsStatus: string
  used30: number
}
export const wsActionTypes: ActionType[] = [
  { id: 'a1', name: 'Call back', setsStatus: 'Waiting for customer', used30: 86 },
  { id: 'a2', name: 'Ship replacement', setsStatus: 'On hold', used30: 12 },
  { id: 'a3', name: 'Remote session', setsStatus: 'Investigating', used30: 31 },
  { id: 'a4', name: 'Issue refund', setsStatus: 'Resolved', used30: 19 },
]

export interface CustomerTag {
  id: string
  name: string
  description: string
  customers: number
  autoAdded: boolean
}
export const wsCustomerTags: CustomerTag[] = [
  {
    id: 'tg1',
    name: 'VIP',
    description: 'Key accounts — reply within 30 minutes',
    customers: 4,
    autoAdded: false,
  },
  {
    id: 'tg2',
    name: 'Frequent caller',
    description: 'Called 3+ times in 30 days',
    customers: 23,
    autoAdded: true,
  },
  {
    id: 'tg3',
    name: 'At risk',
    description: '2+ breached SLAs this month',
    customers: 6,
    autoAdded: true,
  },
  {
    id: 'tg4',
    name: 'Zendesk import',
    description: 'Created by the Zendesk sync',
    customers: 184,
    autoAdded: true,
  },
  {
    id: 'tg5',
    name: 'Reseller',
    description: 'Sells TBT products to their clients',
    customers: 9,
    autoAdded: false,
  },
  {
    id: 'tg6',
    name: 'New',
    description: 'Joined in the last 30 days',
    customers: 15,
    autoAdded: true,
  },
]

export interface RuleCondition {
  field: string
  op: string
  value: string
}
export interface RuleAction {
  kind: string
  value: string
}
export interface RoutingRule {
  id: string
  name: string
  conditions: RuleCondition[]
  /** Shown when there are no conditions, e.g. "No other rule matched". */
  fallback?: string
  actions: RuleAction[]
  active: boolean
  /** Matches in the last 30 days (for the preview line). */
  matched30: number
}
export const RULE_FIELDS: Record<string, string[]> = {
  Application: ['Customer Portal', 'POS', 'Inventory', 'Payments', 'Billing'],
  Priority: ['Urgent', 'High', 'Medium', 'Low'],
  Channel: ['Email', 'Chat', 'Phone', 'SMS'],
  'Customer tag': ['VIP', 'Frequent caller', 'At risk', 'Reseller'],
  Created: ['Outside business hours', 'Inside business hours'],
}
export const RULE_OPS = ['is', 'is not', 'is any of']
export const RULE_ACTIONS = [
  'Assign to team',
  'Assign to agent',
  'Notify',
  'Set SLA policy',
  'Set priority',
  'Add tag',
]
export const wsRoutingRules: RoutingRule[] = [
  {
    id: 'r1',
    name: 'Urgent POS problems',
    conditions: [
      { field: 'Application', op: 'is', value: 'POS' },
      { field: 'Priority', op: 'is any of', value: 'Urgent' },
    ],
    actions: [
      { kind: 'Assign to team', value: 'Technical Team Beta' },
      { kind: 'Notify', value: 'Arun M.' },
      { kind: 'Set SLA policy', value: 'Urgent' },
    ],
    active: true,
    matched30: 14,
  },
  {
    id: 'r2',
    name: 'VIP customers',
    conditions: [{ field: 'Customer tag', op: 'is', value: 'VIP' }],
    actions: [{ kind: 'Assign to agent', value: 'Tharsi K.' }],
    active: true,
    matched30: 9,
  },
  {
    id: 'r3',
    name: 'Billing questions',
    conditions: [{ field: 'Application', op: 'is', value: 'Billing' }],
    actions: [{ kind: 'Assign to team', value: 'Sales Team Gamma' }],
    active: true,
    matched30: 31,
  },
  {
    id: 'r4',
    name: 'After hours',
    conditions: [{ field: 'Created', op: 'is', value: 'Outside business hours' }],
    actions: [{ kind: 'Assign to team', value: 'Night shift' }],
    active: false,
    matched30: 22,
  },
  {
    id: 'r5',
    name: 'Everything else',
    conditions: [],
    fallback: 'No other rule matched',
    actions: [{ kind: 'Assign to team', value: 'Support Team Alpha' }],
    active: true,
    matched30: 201,
  },
]

export interface ZendeskSettings {
  importTickets: boolean
  matchByPhone: boolean
  syncReplies: boolean
  tagImported: boolean
  mapping: { id: string; zendesk: string; tbt: string }[]
}
export const ZENDESK_TBT_FIELDS = [
  'Customer phone',
  'Customer email',
  'Organization',
  'Team',
  'Application',
  'Priority',
  'Don’t import',
]
export const wsZendesk: ZendeskSettings = {
  importTickets: true,
  matchByPhone: true,
  syncReplies: false,
  tagImported: true,
  mapping: [
    { id: 'm1', zendesk: 'Requester phone', tbt: 'Customer phone' },
    { id: 'm2', zendesk: 'Organization', tbt: 'Organization' },
    { id: 'm3', zendesk: 'Group', tbt: 'Team' },
    { id: 'm4', zendesk: 'Custom field: Product', tbt: 'Application' },
  ],
}

export interface PhoneNumber {
  id: string
  number: string
  label: string
  routesTo: string
}
export interface RingCentralSettings {
  missedCallTickets: boolean
  voicemail: boolean
  recordings: boolean
  reopen: boolean
}
export const wsPhoneNumbers: PhoneNumber[] = [
  { id: 'n1', number: '(909) 802-3652', label: 'Main line', routesTo: 'Support Team Alpha' },
  { id: 'n2', number: '(415) 265-3075', label: 'POS hotline', routesTo: 'Technical Team Beta' },
  { id: 'n3', number: '(626) 446-5263', label: 'Billing', routesTo: 'Sales Team Gamma' },
]
export const wsRingCentral: RingCentralSettings = {
  missedCallTickets: true,
  voicemail: true,
  recordings: false,
  reopen: true,
}

export interface BackupFile {
  id: string
  file: string
  createdBy: string
  size: string
  created: string
}
export const wsBackups: BackupFile[] = [
  {
    id: 'b1',
    file: 'backup-2026-11-20.zip',
    createdBy: 'Automatic',
    size: '412 MB',
    created: 'Today, 2:00 AM',
  },
  {
    id: 'b2',
    file: 'backup-2026-11-19.zip',
    createdBy: 'Automatic',
    size: '409 MB',
    created: 'Yesterday',
  },
  {
    id: 'b3',
    file: 'customers-nov.csv',
    createdBy: 'Tharsi K.',
    size: '1.1 MB',
    created: 'Nov 14',
  },
]
