import type { ComponentProps } from 'react'
import { StatusGlyph } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { TICKET_STATUS_LABEL, type TicketStatus } from '@/types'

const PILL: Record<TicketStatus, string> = {
  open: 'bg-info-soft text-info',
  investigating: 'bg-warning-soft text-warning',
  waiting: 'bg-muted text-foreground',
  'on-hold': 'bg-muted text-foreground',
  resolved: 'bg-success-soft text-success',
  closed: 'bg-muted text-foreground',
}

export interface TicketStatusBadgeProps extends Omit<ComponentProps<'span'>, 'children'> {
  status: TicketStatus
  /**
   * glyph — 14px glyph only (dense tables; has an accessible label) ·
   * label — glyph + Small label (default) · pill — tinted capsule, Caption label.
   */
  variant?: 'glyph' | 'label' | 'pill'
}

/** Ticket status (Figma 10 · Ticket status). Shape + label always carry the meaning, never colour alone. */
export function TicketStatusBadge({
  status,
  variant = 'label',
  className,
  ...props
}: TicketStatusBadgeProps) {
  const label = TICKET_STATUS_LABEL[status]
  if (variant === 'glyph') {
    return (
      <span
        data-slot="ticket-status"
        data-status={status}
        className={cn('inline-flex', className)}
        {...props}
      >
        <StatusGlyph status={status} />
      </span>
    )
  }
  return (
    <span
      data-slot="ticket-status"
      data-status={status}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap',
        variant === 'label' && 'text-small text-foreground',
        variant === 'pill' && cn('h-5.5 rounded-full pr-2 pl-1.5 text-caption', PILL[status]),
        className,
      )}
      {...props}
    >
      <StatusGlyph status={status} label={null} />
      {label}
    </span>
  )
}
