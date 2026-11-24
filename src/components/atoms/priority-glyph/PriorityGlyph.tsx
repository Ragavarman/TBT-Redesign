import type { SVGProps } from 'react'
import { cn } from '@/lib/utils'
import { TICKET_PRIORITY_LABEL, type TicketPriority } from '@/types'

const BARS = [
  { x: 1.5, y: 10, h: 4 },
  { x: 5.75, y: 7, h: 7 },
  { x: 10, y: 4, h: 10 },
] as const
const FILLED: Record<Exclude<TicketPriority, 'urgent'>, number> = { low: 1, medium: 2, high: 3 }

export interface PriorityGlyphProps extends Omit<SVGProps<SVGSVGElement>, 'ref'> {
  priority: TicketPriority
  /** Pixel size. Default 14 (the Figma grid). */
  size?: number
  /** Accessible label. Defaults to "Low priority" etc.; pass `null` when a visible label sits next to it. */
  label?: string | null
}

/**
 * Ticket priority glyph (Figma 10 · glyph/priority-*): 1–3 filled signal bars,
 * urgent = destructive square with “!”. Bars use `foreground` / `border`.
 */
export function PriorityGlyph({
  priority,
  size = 14,
  label,
  className,
  ...props
}: PriorityGlyphProps) {
  const name = label === undefined ? `${TICKET_PRIORITY_LABEL[priority]} priority` : label
  return (
    <svg
      viewBox="0 0 14 14"
      width={size}
      height={size}
      fill="none"
      role={name ? 'img' : undefined}
      aria-label={name ?? undefined}
      aria-hidden={name ? undefined : true}
      data-slot="priority-glyph"
      data-priority={priority}
      className={cn('shrink-0', className)}
      {...props}
    >
      {priority === 'urgent' ? (
        <>
          <rect x="1" y="1" width="12" height="12" rx="3" className="fill-destructive" />
          <path
            d="M7 4V7.6"
            className="stroke-background"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="7" cy="10" r="0.8" className="fill-background" />
        </>
      ) : (
        BARS.map((b, i) => (
          <rect
            key={b.x}
            x={b.x}
            y={b.y}
            width="2.5"
            height={b.h}
            rx="1"
            className={i < FILLED[priority] ? 'fill-foreground' : 'fill-border'}
          />
        ))
      )}
    </svg>
  )
}
