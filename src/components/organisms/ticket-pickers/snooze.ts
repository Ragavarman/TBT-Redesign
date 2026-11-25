import { addDays } from '@/components/molecules'

export const at = (day: string, hour: number) => `${day}T${String(hour).padStart(2, '0')}:00:00Z`
export const HOURS = Array.from({ length: 13 }, (_, i) => i + 7) // 7 AM – 7 PM
export const hourLabel = (h: number) => `${h % 12 || 12}:00 ${h < 12 ? 'AM' : 'PM'}`

/** "Mon 9:00 AM" / "9:00 AM" — how a snooze time reads in the menu and the header. */
export function snoozeLabel(iso: string, now: string) {
  const sameDay = iso.slice(0, 10) === now.slice(0, 10)
  const tomorrow = iso.slice(0, 10) === addDays(now.slice(0, 10), 1)
  const time = hourLabel(Number(iso.slice(11, 13)))
  if (sameDay) return `Today ${time}`
  if (tomorrow) return `Tomorrow ${time}`
  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(iso))
  return `${day}, ${time}`
}
