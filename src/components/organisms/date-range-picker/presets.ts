import { addDays } from '@/components/molecules'

export interface DateRange {
  /** "YYYY-MM-DD". */
  start: string
  /** "YYYY-MM-DD", inclusive. */
  end: string
}

export type PresetId =
  'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'thisQuarter'

export const PRESETS: { id: PresetId; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'thisMonth', label: 'This month' },
  { id: 'lastMonth', label: 'Last month' },
  { id: 'thisQuarter', label: 'This quarter' },
]

const ym = (d: string) => d.slice(0, 7)
const firstOf = (month: string) => `${month}-01`
const lastOf = (month: string) => {
  const [y, m] = month.split('-').map(Number) as [number, number]
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
}

/** The range a preset means on a given day (UTC dates). */
export function presetRange(id: PresetId, today: string): DateRange {
  switch (id) {
    case 'today':
      return { start: today, end: today }
    case 'yesterday': {
      const y = addDays(today, -1)
      return { start: y, end: y }
    }
    case 'last7':
      return { start: addDays(today, -6), end: today }
    case 'last30':
      return { start: addDays(today, -29), end: today }
    case 'thisMonth':
      return { start: firstOf(ym(today)), end: today }
    case 'lastMonth': {
      const prev = ym(addDays(firstOf(ym(today)), -1))
      return { start: firstOf(prev), end: lastOf(prev) }
    }
    case 'thisQuarter': {
      const [y, m] = ym(today).split('-').map(Number) as [number, number]
      const qm = Math.floor((m - 1) / 3) * 3 + 1
      return { start: `${y}-${String(qm).padStart(2, '0')}-01`, end: today }
    }
  }
}

/** Which preset a range matches, if any. */
export const matchPreset = (r: DateRange, today: string) =>
  PRESETS.find((p) => {
    const x = presetRange(p.id, today)
    return x.start === r.start && x.end === r.end
  })?.id

const fmt = (d: string, o: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', { ...o, timeZone: 'UTC' }).format(new Date(`${d}T00:00:00Z`))

/** "Nov 11 – Nov 18, 2026" (or "Nov 18, 2026" for one day). */
export function formatRange(r: DateRange) {
  if (r.start === r.end) return fmt(r.start, { month: 'short', day: 'numeric', year: 'numeric' })
  const sameYear = r.start.slice(0, 4) === r.end.slice(0, 4)
  return `${fmt(r.start, { month: 'short', day: 'numeric', ...(sameYear ? {} : { year: 'numeric' }) })} – ${fmt(r.end, { month: 'short', day: 'numeric', year: 'numeric' })}`
}

/** "Nov 16, 2026". */
export const formatDay = (d: string) => fmt(d, { month: 'short', day: 'numeric', year: 'numeric' })
