import type { SVGProps } from 'react'
import { rem } from '@/lib/units'
import { cn } from '@/lib/utils'
import { TICKET_STATUS_LABEL, type TicketStatus } from '@/types'

/**
 * Ticket status glyph (Figma 10 · glyph/status-*), 14×14 grid.
 * Shape carries meaning on its own (dashed, half-filled, clock, pause, check, cross) —
 * colour is a second cue, never the only one.
 */
const GLYPHS: Record<TicketStatus, { tone: string; body: React.ReactNode }> = {
  open: {
    tone: 'text-info',
    body: (
      <circle
        cx="7"
        cy="7"
        r="5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2.06 2.06"
      />
    ),
  },
  investigating: {
    tone: 'text-warning',
    body: (
      <>
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 3C9.2 3 11 4.8 11 7C11 9.2 9.2 11 7 11V3Z" fill="currentColor" />
      </>
    ),
  },
  waiting: {
    tone: 'text-muted-foreground',
    body: (
      <>
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7 4.2V7L9 8.2"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  'on-hold': {
    tone: 'text-muted-foreground',
    body: (
      <>
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.6 5V9M8.4 5V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </>
    ),
  },
  resolved: {
    tone: 'text-success',
    body: (
      <>
        <circle cx="7" cy="7" r="6" fill="currentColor" />
        <path
          d="M4.4 7.2L6.3 9L9.7 5.2"
          className="stroke-background"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  closed: {
    tone: 'text-muted-foreground',
    body: (
      <>
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M5.2 5.2L8.8 8.8M8.8 5.2L5.2 8.8"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </>
    ),
  },
}

export interface StatusGlyphProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  status: TicketStatus
  /** Pixel size. Default 14 (the Figma grid). */
  size?: number
  /** Accessible label. Defaults to the status name; pass `null` when a visible label sits next to it. */
  label?: string | null
}

export function StatusGlyph({
  status,
  size = 14,
  label,
  className,
  style,
  ...props
}: StatusGlyphProps) {
  const g = GLYPHS[status]
  const name = label === undefined ? TICKET_STATUS_LABEL[status] : label
  return (
    <svg
      viewBox="0 0 14 14"
      width={size}
      height={size}
      // Figma px → rem so the glyph grows with the UI scale
      style={{ width: rem(size), height: rem(size), ...style }}
      fill="none"
      role={name ? 'img' : undefined}
      aria-label={name ?? undefined}
      aria-hidden={name ? undefined : true}
      data-slot="status-glyph"
      data-status={status}
      className={cn('shrink-0', g.tone, className)}
      {...props}
    >
      {g.body}
    </svg>
  )
}
