import type { DateRange } from '@/components/organisms'
import { createdVsResolved, WS_NOW } from '@/mocks'

/** "Last 30 days" ending on the workspace's today. */
export function last30(): DateRange {
  const end = WS_NOW.slice(0, 10)
  return {
    start: new Date(Date.parse(`${end}T00:00:00Z`) - 29 * 86_400_000).toISOString().slice(0, 10),
    end,
  }
}

/** Scale a 30-day figure to the chosen period. */
export const scaled = (n: number, r: DateRange) => Math.round((n * rangeDays(r)) / 30)

/** Deterministic 0..1 noise for illustrative trends. */
export const seeded = (seed: string) => noise(seed)

/**
 * Illustrative created / resolved volume for any period (the mock workspace has no history).
 * Deterministic per date and team, so a range always draws the same chart. Figma's own range
 * (Nov 11 – 18, 2026, all teams) uses Figma's exact numbers.
 */

export interface VolumePoint {
  label: string
  created: number
  resolved: number
}

const DAY = 86_400_000
const toTime = (d: string) => Date.parse(`${d}T00:00:00Z`)
const iso = (t: number) => new Date(t).toISOString().slice(0, 10)
const short = (d: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${d}T00:00:00Z`),
  )

/** Small stable hash → 0..1. */
function noise(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return ((h >>> 0) % 1000) / 1000
}

const TEAM_SHARE: Record<string, number> = {
  all: 1,
  'Support Team Alpha': 0.62,
  'Technical Team Beta': 0.25,
  'Sales Team Gamma': 0.13,
}

function day(d: string, team: string): VolumePoint {
  const weekend = [0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay())
  const base = (weekend ? 14 : 26) + noise(d) * 40
  const created = Math.round(base * (TEAM_SHARE[team] ?? 0.2))
  const resolved = Math.round(created * (0.6 + noise(`${d}r`) * 0.35))
  return { label: short(d), created, resolved }
}

export const rangeDays = (r: DateRange) => Math.round((toTime(r.end) - toTime(r.start)) / DAY) + 1

/** Daily points up to 14 days; weekly sums beyond that (so bars stay readable). */
export function volumeSeries(
  r: DateRange,
  team = 'all',
): { points: VolumePoint[]; unit: 'Daily' | 'Weekly' } {
  if (r.start === '2026-11-11' && r.end === '2026-11-18' && team === 'all') {
    return {
      unit: 'Daily',
      points: createdVsResolved.map((p) => ({
        label: p.label,
        created: p.values.created!,
        resolved: p.values.resolved!,
      })),
    }
  }
  const days = Array.from({ length: rangeDays(r) }, (_, i) => iso(toTime(r.start) + i * DAY))
  const daily = days.map((d) => day(d, team))
  // fixed-width bars: beyond two weeks a daily chart no longer fits, so sum by week
  if (days.length <= 14) return { unit: 'Daily', points: daily }
  const weeks: VolumePoint[] = []
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7)
    weeks.push({
      label: `Wk ${short(days[i]!)}`,
      created: chunk.reduce((n, p) => n + p.created, 0),
      resolved: chunk.reduce((n, p) => n + p.resolved, 0),
    })
  }
  return { unit: 'Weekly', points: weeks }
}

/** The period of the same length just before. */
export function previousRange(r: DateRange): DateRange {
  const n = rangeDays(r)
  return { start: iso(toTime(r.start) - n * DAY), end: iso(toTime(r.start) - DAY) }
}

export const total = (pts: VolumePoint[], k: 'created' | 'resolved') =>
  pts.reduce((n, p) => n + p[k], 0)

/** "+12%", "−8%", "0%". */
export function change(now: number, before: number) {
  if (!before) return now ? '+100%' : '0%'
  const pct = Math.round(((now - before) / before) * 100)
  return `${pct > 0 ? '+' : pct < 0 ? '−' : ''}${Math.abs(pct)}%`
}
