import type { AssetCondition } from './inventory'

/** Customer profile (Figma Interface · 05b Customer — Profile, C1 Notes, C2 Assets, X14 Calls). */

export interface CustomerNote {
  id: string
  author: { name: string; avatarUrl?: string }
  body: string
  /** ISO timestamp. */
  at: string
  pinned?: boolean
}

export type CustomerCallType = 'voicemail' | 'missed' | 'answered'

export interface CustomerCall {
  id: string
  /** ISO timestamp. */
  at: string
  type: CustomerCallType
  /** Who picked up (answered calls). */
  agent?: string
  /** Seconds; missing for missed calls. */
  duration?: number
  /** A recording exists (voicemails, recorded calls). */
  recording?: boolean
  ticketId?: number
}

export interface CustomerAsset {
  id: string
  name: string
  serial: string
  location: string
  condition: AssetCondition
  /** Warranty end, "YYYY-MM". */
  warrantyUntil: string
}

export interface CustomerProfile {
  customerId: string
  company?: string
  location?: string
  /** ISO date. */
  since: string
  /** "Zendesk import", "Phone", "Portal sign-up". */
  source: string
  tags: string[]
  notes: CustomerNote[]
  assets: CustomerAsset[]
  calls: CustomerCall[]
  stats: {
    /** "12m ago · phone". */
    lastContact: string
    /** "6h 10m". */
    avgResolution: string
    /** Out of 5. */
    csat?: number
  }
  /** Imported record that an agent should check (Customers › Needs review). */
  needsReview?: boolean
}

/** "0:42", "6:48". */
export const formatDuration = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
