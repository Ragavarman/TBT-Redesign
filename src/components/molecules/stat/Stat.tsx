import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface StatDelta {
  /** Display text, e.g. "+12%" or "−8%". */
  value: ReactNode
  /** Direction of change. */
  trend: 'up' | 'down' | 'neutral'
  /** Comparison text, e.g. "vs last week". */
  caption?: ReactNode
}

export interface StatProps extends ComponentProps<'div'> {
  label: ReactNode
  value: ReactNode
  /** 16px icon at the top-right. */
  icon?: IconName | LucideIcon
  delta?: StatDelta
  /**
   * Which direction is good. Default `up` (more is better → up is success).
   * Use `down` for metrics like response time or backlog.
   */
  goodDirection?: 'up' | 'down'
}

const TREND_ICON = { up: 'arrow-up', down: 'arrow-down', neutral: 'minus' } as const

/** KPI tile (Figma 08 · Stat): label · Display value · trend delta. */
export function Stat({
  label,
  value,
  icon,
  delta,
  goodDirection = 'up',
  className,
  ...props
}: StatProps) {
  const tone =
    !delta || delta.trend === 'neutral'
      ? 'text-muted-foreground'
      : delta.trend === goodDirection
        ? 'text-success'
        : 'text-destructive'
  return (
    <div
      data-slot="stat"
      className={cn('flex flex-col gap-2 rounded-xl border bg-card p-4', className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-small text-muted-foreground">{label}</span>
        {icon &&
          (typeof icon === 'string' ? (
            <Icon name={icon} size={16} className="text-foreground" />
          ) : (
            <Icon icon={icon} size={16} className="text-foreground" />
          ))}
      </div>
      <span className="text-display text-card-foreground tabular-nums">{value}</span>
      {delta && (
        <div className="flex items-center gap-1 text-caption">
          <span className={cn('inline-flex items-center gap-1', tone)}>
            <Icon name={TREND_ICON[delta.trend]} size={12} />
            {delta.value}
          </span>
          {delta.caption && <span className="text-muted-foreground">{delta.caption}</span>}
        </div>
      )}
    </div>
  )
}
