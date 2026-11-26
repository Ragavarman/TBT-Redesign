import { wsAppVolume } from '@/mocks'
import { seeded } from './report-data'

/** A report built in the custom-report builder (Figma Interface · R5). */
export interface SavedReport {
  id: string
  name: string
  measure: Measure
  groupBy: GroupBy
  splitBy: SplitBy
  range: RangeOption
  chart: ChartType
  filters: string[]
}

export type Measure = 'created' | 'resolved' | 'backlog' | 'firstReply'
export type GroupBy = 'application' | 'priority' | 'channel' | 'team' | 'week'
export type SplitBy = 'none' | 'priority' | 'channel'
export type RangeOption = '30d' | '90d' | 'quarter'
export type ChartType = 'bar' | 'table' | 'number'

export const MEASURES: { value: Measure; label: string }[] = [
  { value: 'created', label: 'Tickets created' },
  { value: 'resolved', label: 'Tickets resolved' },
  { value: 'backlog', label: 'Open backlog' },
  { value: 'firstReply', label: 'First reply (minutes)' },
]
export const GROUPS: { value: GroupBy; label: string }[] = [
  { value: 'application', label: 'Application' },
  { value: 'priority', label: 'Priority' },
  { value: 'channel', label: 'Channel' },
  { value: 'team', label: 'Team' },
  { value: 'week', label: 'Week' },
]
export const SPLITS: { value: SplitBy; label: string }[] = [
  { value: 'none', label: 'No split' },
  { value: 'priority', label: 'Priority (high & urgent)' },
  { value: 'channel', label: 'Channel (phone)' },
]
export const RANGES: { value: RangeOption; label: string; weeks: number }[] = [
  { value: '30d', label: 'Last 30 days · weekly', weeks: 4 },
  { value: '90d', label: 'Last 90 days · weekly', weeks: 13 },
  { value: 'quarter', label: 'This quarter · weekly', weeks: 8 },
]
export const CHARTS: { value: ChartType; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'table', label: 'Table' },
  { value: 'number', label: 'Number' },
]
export const FILTER_OPTIONS = [
  'Label is Hardware',
  'Label is Billing',
  'Team is Support Team Alpha',
  'Team is Technical Team Beta',
  'Channel is Phone',
  'Priority is High or Urgent',
]

export const DEFAULT_REPORT: Omit<SavedReport, 'id'> = {
  name: 'Untitled report',
  measure: 'created',
  groupBy: 'application',
  splitBy: 'priority',
  range: '90d',
  chart: 'bar',
  filters: [],
}

/** Built-in saved report (sidebar › Saved reports › Weekly summary). */
export const WEEKLY_SUMMARY: SavedReport = {
  id: 'weekly',
  name: 'Weekly summary',
  measure: 'created',
  groupBy: 'week',
  splitBy: 'priority',
  range: '90d',
  chart: 'bar',
  filters: [],
}

const CATEGORIES: Record<GroupBy, (weeks: number) => string[]> = {
  application: () => wsAppVolume.map((a) => a.app),
  priority: () => ['Urgent', 'High', 'Medium', 'Low'],
  channel: () => ['Phone', 'Email', 'Chat', 'SMS'],
  team: () => ['Support Alpha', 'Technical Beta', 'Sales Gamma'],
  week: (weeks) => Array.from({ length: weeks }, (_, i) => `W${48 - weeks + i}`),
}

const SCALE: Record<Measure, number> = { created: 60, resolved: 52, backlog: 18, firstReply: 90 }

/** Illustrative values for the preview — stable for a given configuration. */
export function reportData(r: Omit<SavedReport, 'id' | 'name' | 'chart'>) {
  const weeks = RANGES.find((x) => x.value === r.range)!.weeks
  const filterFactor = 1 / (1 + r.filters.length * 0.6)
  const perBucket = r.groupBy === 'week' ? 1 : weeks / 4
  return CATEGORIES[r.groupBy](weeks).map((label) => {
    const base =
      (0.35 + seeded(`${r.measure}${label}`) * 0.65) * SCALE[r.measure] * perBucket * filterFactor
    const all = Math.max(1, Math.round(base))
    const part =
      r.splitBy === 'none'
        ? undefined
        : Math.round(all * (0.25 + seeded(`${label}${r.splitBy}`) * 0.2))
    return { label, all, part }
  })
}

export const splitLabel = (s: SplitBy) =>
  s === 'priority' ? 'High & urgent' : s === 'channel' ? 'Phone' : undefined
