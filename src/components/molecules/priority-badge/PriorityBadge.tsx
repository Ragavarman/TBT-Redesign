import type { ComponentProps } from 'react'
import { PriorityGlyph } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { TICKET_PRIORITY_LABEL, type TicketPriority } from '@/types'

export interface PriorityBadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  priority: TicketPriority
  /** glyph — signal bars only (has an accessible label) · label — glyph + Small label (default). */
  variant?: 'glyph' | 'label'
}

/** Ticket priority (Figma 10 · Priority). Urgent labels are destructive. */
export function PriorityBadge({
  priority,
  variant = 'label',
  className,
  ...props
}: PriorityBadgeProps) {
  return (
    <span
      data-slot="priority-badge"
      data-priority={priority}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 text-small whitespace-nowrap',
        priority === 'urgent' ? 'text-destructive' : 'text-foreground',
        className,
      )}
      {...props}
    >
      <PriorityGlyph priority={priority} label={variant === 'glyph' ? undefined : null} />
      {variant === 'label' && TICKET_PRIORITY_LABEL[priority]}
    </span>
  )
}
