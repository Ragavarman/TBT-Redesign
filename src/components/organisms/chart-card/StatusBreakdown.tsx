import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface BreakdownItem {
  id: string
  label: ReactNode
  value: number
  /** Leading 16px glyph, e.g. <StatusGlyph status="open" label={null} />. */
  glyph?: ReactNode
  /** Segment fill in the distribution bar: a bg-* class. */
  fill: string
}

export interface StatusBreakdownProps extends ComponentProps<'div'> {
  items: BreakdownItem[]
  /** Accessible name of the distribution bar. */
  label: string
}

const pct = (v: number, total: number) => (total > 0 ? Math.round((v / total) * 100) : 0)

/**
 * Part-to-whole breakdown: an 8px segmented bar (2px surface gaps) over labelled rows of
 * glyph · label · count · share. Identity never rests on colour alone: every segment has a row.
 */
export function StatusBreakdown({ items, label, className, ...props }: StatusBreakdownProps) {
  const total = items.reduce((n, i) => n + i.value, 0)
  return (
    <div data-slot="status-breakdown" className={cn('flex flex-col gap-4', className)} {...props}>
      <div role="img" aria-label={label} className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {items
          .filter((i) => i.value > 0)
          .map((i) => (
            <span
              key={i.id}
              className={cn('min-w-0.5', i.fill)}
              style={{ flex: `${i.value} 1 0` }}
            />
          ))}
      </div>
      <ul className="flex flex-col">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-2.5 py-2 text-body">
            {i.glyph}
            <span className="min-w-0 flex-1 truncate text-foreground">{i.label}</span>
            <span
              className={cn(
                'text-body-strong tabular-nums',
                i.value === 0 ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              {i.value}
            </span>
            <span className="w-9 text-right text-caption text-muted-foreground tabular-nums">
              {pct(i.value, total)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
