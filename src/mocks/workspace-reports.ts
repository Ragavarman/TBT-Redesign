/**
 * Illustrative report data for the Reports section (Figma Interface · R1–R5). The workspace has
 * no history, so these are fixed shares and rates; charts scale them to the chosen period.
 */

/** Ticket volume by application (R1). Shares of created tickets. */
export const wsAppVolume = [
  { app: 'Customer Portal', share: 0.4, resolvedRate: 0.92 },
  { app: 'POS', share: 0.29, resolvedRate: 0.97 },
  { app: 'Mobile app', share: 0.19, resolvedRate: 0.9 },
  { app: 'Billing', share: 0.12, resolvedRate: 0.8 },
]

/** SLA policies — R2 report rows, and Settings › SLA policies (S7). */
export interface SlaPolicy {
  id: string
  name: string
  appliesTo: string
  /** "Resolve in 4h", "First reply in 30m". */
  target: string
  firstResponseMins: number
  resolveHours: number
  /** 0–1, last 30 days; undefined = no data yet. */
  met?: number
  breached?: number
  avgTime?: string
  businessHours: boolean
  active: boolean
}

export const wsSlaPolicies: SlaPolicy[] = [
  {
    id: 'sla1',
    name: 'Urgent',
    appliesTo: 'Priority is Urgent',
    target: 'Resolve in 4h',
    firstResponseMins: 15,
    resolveHours: 4,
    met: 0.81,
    breached: 3,
    avgTime: '3h 10m',
    businessHours: false,
    active: true,
  },
  {
    id: 'sla2',
    name: 'High',
    appliesTo: 'Priority is High',
    target: 'Resolve in 8h',
    firstResponseMins: 30,
    resolveHours: 8,
    met: 0.87,
    breached: 2,
    avgTime: '6h 05m',
    businessHours: true,
    active: true,
  },
  {
    id: 'sla3',
    name: 'Standard',
    appliesTo: 'All other tickets',
    target: 'Resolve in 24h',
    firstResponseMins: 60,
    resolveHours: 24,
    met: 0.93,
    breached: 2,
    avgTime: '11h 40m',
    businessHours: true,
    active: true,
  },
  {
    id: 'sla4',
    name: 'VIP customers',
    appliesTo: 'Tag is VIP',
    target: 'First reply in 30m',
    firstResponseMins: 30,
    resolveHours: 8,
    businessHours: false,
    active: true,
  },
]

/** Resolution SLA met per week (R2), W40–W47. */
export const wsSlaWeekly = [0.86, 0.88, 0.87, 0.9, 0.89, 0.91, 0.93, 0.92]

/** Agent performance, last 30 days (R3). */
export const wsAgentPerf = [
  {
    name: 'Tharsi K.',
    team: 'Support Alpha',
    assigned: 61,
    resolved: 58,
    resolution: '5h 40m',
    csat: 0.97,
  },
  {
    name: 'Dilini F.',
    team: 'Support Alpha',
    assigned: 54,
    resolved: 50,
    resolution: '6h 15m',
    csat: 0.95,
  },
  {
    name: 'Nimal P.',
    team: 'Support Alpha',
    assigned: 47,
    resolved: 41,
    resolution: '8h 05m',
    csat: 0.91,
  },
  {
    name: 'Arun M.',
    team: 'Technical Beta',
    assigned: 44,
    resolved: 40,
    resolution: '9h 30m',
    csat: 0.93,
  },
  {
    name: 'Kavya S.',
    team: 'Sales Gamma',
    assigned: 38,
    resolved: 37,
    resolution: '4h 50m',
    csat: 0.98,
  },
  {
    name: 'Team Lead',
    team: 'Support Alpha',
    assigned: 31,
    resolved: 27,
    resolution: '10h 10m',
    csat: 0.88,
  },
]

/** Channels, last 30 days (R4). */
export const wsChannelStats = [
  {
    channel: 'Phone',
    tickets: 198,
    firstReply: '—',
    resolution: '5h 20m',
    csat: 0.95,
    note: 'Avg. call 4m 12s',
  },
  {
    channel: 'Email',
    tickets: 128,
    firstReply: '1h 40m',
    resolution: '9h 10m',
    csat: 0.92,
    note: 'First reply 1h 40m',
  },
  {
    channel: 'Chat',
    tickets: 58,
    firstReply: '3m',
    resolution: '1h 05m',
    csat: 0.96,
    note: 'First reply 3m',
  },
  {
    channel: 'SMS',
    tickets: 28,
    firstReply: '22m',
    resolution: '2h 30m',
    csat: 0.9,
    note: 'First reply 22m',
  },
]

/** Phone vs email tickets per week (R4), W40–W47. */
export const wsChannelWeekly = [
  { label: 'W40', phone: 46, email: 30 },
  { label: 'W41', phone: 50, email: 28 },
  { label: 'W42', phone: 54, email: 33 },
  { label: 'W43', phone: 52, email: 31 },
  { label: 'W44', phone: 47, email: 34 },
  { label: 'W45', phone: 55, email: 32 },
  { label: 'W46', phone: 51, email: 30 },
  { label: 'W47', phone: 58, email: 35 },
]
