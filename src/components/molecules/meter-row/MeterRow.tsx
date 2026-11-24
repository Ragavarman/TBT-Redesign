import { useId, type ComponentProps, type ReactNode } from 'react'
import { Progress, type ProgressTone } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface MeterRowProps extends ComponentProps<'div'> {
  /** Leading glyph — e.g. <StatusGlyph status="open" label={null} />. */
  glyph?: ReactNode
  label: ReactNode
  /** The count shown on the right. */
  value: number
  /** Value that fills the bar (e.g. the largest row or the total). */
  max: number
  tone?: ProgressTone
}

/**
 * Labelled bar for breakdowns (Figma 08 · Meter row): glyph + label · 4px bar · count.
 * Stack several to show tickets by status, priority or team.
 */
export function MeterRow({
  glyph,
  label,
  value,
  max,
  tone = 'primary',
  className,
  ...props
}: MeterRowProps) {
  const id = useId()
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div
      data-slot="meter-row"
      className={cn('grid grid-cols-[7.5rem_1fr_auto] items-center gap-3', className)}
      {...props}
    >
      <span id={id} className="flex min-w-0 items-center gap-1.5 text-small text-foreground">
        {glyph}
        <span className="truncate">{label}</span>
      </span>
      <Progress size="sm" tone={tone} value={pct} aria-labelledby={id} />
      <span className="min-w-6 text-right text-label text-foreground tabular-nums">{value}</span>
    </div>
  )
}
