/** Team section data (Figma Interface · 06, 06b, F1–F5, X16, X17). */

export const ROLES = ['Admin', 'Team lead', 'Agent', 'Viewer'] as const
export type Role = (typeof ROLES)[number]
export const TEAM_NAMES = [
  'Support Team Alpha',
  'Technical Team Beta',
  'Sales Team Gamma',
  'Night shift',
]

export interface TeamMember {
  id: string
  name: string
  email: string
  role: Role
  teams: string[]
  ext?: string
  status: 'Active' | 'Away' | 'Invited' | 'Deactivated'
  joined: string
  autoAssign: boolean
  maxOpen: number
  /** "8:30 AM – 5:30 PM". */
  weekdays: string
  saturday?: string
  /** Last 30 days. */
  resolved30: number
  medianResolution: string
  csat: number
}

export const wsTeamMembers: TeamMember[] = [
  {
    id: 'w-tl',
    name: 'Team Lead',
    email: 'lead@tbt.lk',
    role: 'Admin',
    teams: ['Support Team Alpha', 'Technical Team Beta'],
    ext: '200',
    status: 'Active',
    joined: 'Jan 2024',
    autoAssign: true,
    maxOpen: 15,
    weekdays: '8:00 AM – 5:00 PM',
    resolved30: 27,
    medianResolution: '10h 10m',
    csat: 0.88,
  },
  {
    id: 'w-tk',
    name: 'Tharsi K.',
    email: 'tharsi@tbt.lk',
    role: 'Team lead',
    teams: ['Support Team Alpha', 'Technical Team Beta'],
    ext: '204',
    status: 'Active',
    joined: 'Mar 2024',
    autoAssign: true,
    maxOpen: 12,
    weekdays: '8:30 AM – 5:30 PM',
    saturday: '9:00 AM – 1:00 PM',
    resolved30: 58,
    medianResolution: '5h 40m',
    csat: 0.97,
  },
  {
    id: 'w-np',
    name: 'Nimal P.',
    email: 'nimal@tbt.lk',
    role: 'Agent',
    teams: ['Support Team Alpha'],
    ext: '207',
    status: 'Away',
    joined: 'Jun 2024',
    autoAssign: true,
    maxOpen: 12,
    weekdays: '8:30 AM – 5:30 PM',
    resolved30: 41,
    medianResolution: '8h 05m',
    csat: 0.91,
  },
  {
    id: 'w-df',
    name: 'Dilini F.',
    email: 'dilini@tbt.lk',
    role: 'Agent',
    teams: ['Support Team Alpha'],
    ext: '209',
    status: 'Active',
    joined: 'Aug 2024',
    autoAssign: true,
    maxOpen: 12,
    weekdays: '8:30 AM – 5:30 PM',
    resolved30: 50,
    medianResolution: '6h 15m',
    csat: 0.95,
  },
  {
    id: 'w-am',
    name: 'Arun M.',
    email: 'arun@tbt.lk',
    role: 'Agent',
    teams: ['Technical Team Beta'],
    ext: '211',
    status: 'Active',
    joined: 'Jan 2025',
    autoAssign: true,
    maxOpen: 10,
    weekdays: '9:00 AM – 6:00 PM',
    resolved30: 40,
    medianResolution: '9h 30m',
    csat: 0.93,
  },
  {
    id: 'w-ks',
    name: 'Kavya S.',
    email: 'kavya@tbt.lk',
    role: 'Agent',
    teams: ['Sales Team Gamma'],
    ext: '215',
    status: 'Active',
    joined: 'Apr 2025',
    autoAssign: false,
    maxOpen: 8,
    weekdays: '9:00 AM – 6:00 PM',
    resolved30: 37,
    medianResolution: '4h 50m',
    csat: 0.98,
  },
  {
    id: 'w-sr',
    name: 'Sahan Ratnayake',
    email: 'sahan@tbt.lk',
    role: 'Agent',
    teams: ['Support Team Alpha'],
    status: 'Invited',
    joined: '—',
    autoAssign: true,
    maxOpen: 12,
    weekdays: '8:30 AM – 5:30 PM',
    resolved30: 0,
    medianResolution: '—',
    csat: 0,
  },
  {
    id: 'w-vw',
    name: 'Vihanga W.',
    email: 'vihanga@tbt.lk',
    role: 'Viewer',
    teams: [],
    status: 'Active',
    joined: 'Sep 2025',
    autoAssign: false,
    maxOpen: 0,
    weekdays: '9:00 AM – 5:00 PM',
    resolved30: 0,
    medianResolution: '—',
    csat: 0,
  },
]

export interface Team {
  id: string
  name: string
  description: string
  applications: string[]
  assignBy: 'Round robin' | 'Least busy' | 'Manual'
  maxOpen: number
  slaPolicy: string
  hours: string
  outsideHours: string
  slaMet: number
  firstResponse: string
  csat: number
}

export const wsTeams: Team[] = [
  {
    id: 'alpha',
    name: 'Support Team Alpha',
    description: 'First line for POS and portal customers',
    applications: ['Customer Portal', 'POS'],
    assignBy: 'Round robin',
    maxOpen: 12,
    slaPolicy: 'Standard',
    hours: 'Mon – Fri · 8:30 AM – 5:30 PM',
    outsideHours: 'Night shift',
    slaMet: 0.91,
    firstResponse: '58m',
    csat: 0.95,
  },
  {
    id: 'beta',
    name: 'Technical Team Beta',
    description: 'Hardware, firmware and integrations',
    applications: ['Inventory', 'POS'],
    assignBy: 'Least busy',
    maxOpen: 10,
    slaPolicy: 'High',
    hours: 'Mon – Fri · 9:00 AM – 6:00 PM',
    outsideHours: 'Support Team Alpha',
    slaMet: 0.88,
    firstResponse: '1h 12m',
    csat: 0.93,
  },
  {
    id: 'gamma',
    name: 'Sales Team Gamma',
    description: 'Billing, refunds and renewals',
    applications: ['Payments'],
    assignBy: 'Manual',
    maxOpen: 8,
    slaPolicy: 'Standard',
    hours: 'Mon – Fri · 9:00 AM – 6:00 PM',
    outsideHours: 'Support Team Alpha',
    slaMet: 0.94,
    firstResponse: '40m',
    csat: 0.98,
  },
  {
    id: 'night',
    name: 'Night shift',
    description: 'Out-of-hours cover',
    applications: ['POS'],
    assignBy: 'Round robin',
    maxOpen: 6,
    slaPolicy: 'Urgent',
    hours: 'Every day · 6:00 PM – 8:00 AM',
    outsideHours: 'Support Team Alpha',
    slaMet: 0.86,
    firstResponse: '25m',
    csat: 0.9,
  },
]

/** Sidebar team views → team id. */
export const TEAM_VIEW: Record<string, string> = { alpha: 'alpha', beta: 'beta', gamma: 'gamma' }

export interface PermissionRow {
  id: string
  group: 'Tickets' | 'Customers' | 'Workspace'
  label: string
  /** role → allowed. Admin is always true. */
  allowed: Record<string, boolean>
}

const p = (
  id: string,
  group: PermissionRow['group'],
  label: string,
  lead: boolean,
  agent: boolean,
  viewer: boolean,
): PermissionRow => ({
  id,
  group,
  label,
  allowed: { Admin: true, 'Team lead': lead, Agent: agent, Viewer: viewer },
})

export const wsPermissions: PermissionRow[] = [
  p('view', 'Tickets', 'View all tickets', true, true, true),
  p('reply', 'Tickets', 'Reply and add notes', true, true, false),
  p('assign', 'Tickets', 'Assign to others', true, false, false),
  p('merge', 'Tickets', 'Merge and delete tickets', true, false, false),
  p('export', 'Tickets', 'Export tickets', true, false, false),
  p('editCustomers', 'Customers', 'Edit customers', true, true, false),
  p('mergeCustomers', 'Customers', 'Merge duplicates', true, false, false),
  p('teams', 'Workspace', 'Manage teams and agents', true, false, false),
  p('sla', 'Workspace', 'Edit SLA policies and routing', false, false, false),
  p('integrations', 'Workspace', 'Manage integrations', false, false, false),
  p('billing', 'Workspace', 'Billing and backups', false, false, false),
]

export interface Invite {
  id: string
  email: string
  role: Role
  teams: string[]
  invitedBy: string
  sent: string
  /** Days until it expires; negative = expired. */
  expiresIn: number
}

export const wsInvites: Invite[] = [
  {
    id: 'inv1',
    email: 'sahan@tbt.lk',
    role: 'Agent',
    teams: ['Support Team Alpha'],
    invitedBy: 'Tharsi K.',
    sent: '2 days ago',
    expiresIn: 5,
  },
  {
    id: 'inv2',
    email: 'priya@tbt.lk',
    role: 'Team lead',
    teams: [],
    invitedBy: 'Arun M.',
    sent: '8 days ago',
    expiresIn: -1,
  },
]
