import type { ComponentProps, ReactNode } from 'react'
import { Icon } from '@/components/atoms'
import { CAPTION } from '@/lib/optical'
import { cn } from '@/lib/utils'
import { SLA_STATE_LABEL, type SlaState } from '@/types'

const TONE: Record<SlaState, string> = {
  'on-track': 'bg-success-soft text-success',
  'at-risk': 'bg-warning-soft text-warning',
  breached: 'bg-destructive-soft text-destructive',
}

export interface SlaBadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  state: SlaState
  /** Time text, e.g. "1h 20m left" or "Breached 12m ago". */
  children: ReactNode
}

/** SLA timer (Figma 10 · SLA badge): clock + time in a tinted capsule. */
export function SlaBadge({ state, children, className, ...props }: SlaBadgeProps) {
  return (
    <span
      data-slot="sla-badge"
      data-state={state}
      className={cn(
        // optical padding (Caption + --py → 22px); clock pulled to the edge
        'optical-edges inline-flex shrink-0 items-center rounded-full optical whitespace-nowrap [--icon:12px]',
        CAPTION.md,
        TONE[state],
        className,
      )}
      {...props}
    >
      <Icon name="clock" size={12} />
      <span className="sr-only">SLA {SLA_STATE_LABEL[state].toLowerCase()}: </span>
      <span>{children}</span>
    </span>
  )
}
