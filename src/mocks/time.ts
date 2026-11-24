import { MOCK_NOW } from './tickets'

/**
 * Relative time against the fixed mock "now" — "5m ago", "2h ago", "3d ago".
 * Stories only; a real app would use Intl.RelativeTimeFormat against Date.now().
 */
export function ago(iso: string, now: string = MOCK_NOW): string {
  const s = Math.max(0, (Date.parse(now) - Date.parse(iso)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
