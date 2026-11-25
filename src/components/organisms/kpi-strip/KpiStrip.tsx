import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface KpiItem {
  /** Stable key. */
  id: string
  /** Metric name (Overline, muted). */
  label: ReactNode
  /** Headline number (Display). */
  value: ReactNode
  /** Colour of the value — `destructive` for breaches, `muted` for zero. Default foreground. */
  tone?: 'default' | 'destructive' | 'success' | 'muted'
  /** Small badge beside the value, e.g. a delta "+12". */
  badge?: ReactNode
  /** Line under the value (Small, muted) — a comparison or a status badge. */
  support?: ReactNode
}

export interface KpiStripProps extends ComponentProps<'section'> {
  items: KpiItem[]
  /** Accessible name for the strip. Default "Key metrics". */
  label?: string
}

const TONE = {
  default: 'text-foreground',
  destructive: 'text-destructive',
  success: 'text-success',
  muted: 'text-muted-foreground',
} as const

/**
 * Joined row of headline numbers (Figma Interface · KPI summary): one card,
 * equal cells split by 1px dividers, 18px padding.
 */
export function KpiStrip({ items, label = 'Key metrics', className, ...props }: KpiStripProps) {
  return (
    <section
      data-slot="kpi-strip"
      aria-label={label}
      className={cn(
        'grid auto-cols-fr grid-flow-col overflow-hidden rounded-xl border bg-card',
        className,
      )}
      {...props}
    >
      {items.map((item) => (
        <dl
          key={item.id}
          data-slot="kpi"
          className="flex min-w-0 flex-col gap-3 border-r p-4.5 last:border-r-0"
        >
          <dt className="truncate text-overline text-muted-foreground">{item.label}</dt>
          <dd className="flex items-center gap-2">
            <span className={cn('text-display tabular-nums', TONE[item.tone ?? 'default'])}>
              {item.value}
            </span>
            {item.badge}
          </dd>
          {item.support && (
            <dd className="flex min-h-4.5 items-center gap-1.5 text-small text-muted-foreground">
              {item.support}
            </dd>
          )}
        </dl>
      ))}
    </section>
  )
}
