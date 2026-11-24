import type { ComponentProps } from 'react'
import { Avatar, PriorityGlyph, StatusGlyph } from '@/components/atoms'
import { cn } from '@/lib/utils'
import type { Ticket } from '@/types'

export interface TicketRowProps extends Omit<ComponentProps<'button'>, 'children'> {
  ticket: Ticket
  /** Short relative time, e.g. "1d". */
  timeLabel: string
  selected?: boolean
  /** Show the preview after the subject. Default true. */
  showPreview?: boolean
}

/**
 * Dense 40px ticket row for wide lists (Figma 10 · Ticket row):
 * status · customer · #id · subject + preview · priority · time · assignee.
 */
export function TicketRow({
  ticket,
  timeLabel,
  selected,
  showPreview = true,
  className,
  ...props
}: TicketRowProps) {
  return (
    <button
      type="button"
      data-slot="ticket-row"
      data-selected={selected || undefined}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'flex h-10 w-full items-center gap-3 border-b bg-background px-4 text-left outline-none',
        'transition-colors duration-150 hover:bg-accent data-selected:bg-muted',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        className,
      )}
      {...props}
    >
      <StatusGlyph status={ticket.status} />
      <span className="w-40 shrink-0 truncate text-body text-foreground">
        {ticket.requester.name}
      </span>
      <span className="w-13 shrink-0 text-small text-muted-foreground tabular-nums">
        #{ticket.id}
      </span>
      <span className="flex min-w-0 flex-1 items-baseline gap-2">
        <span
          className={cn(
            'shrink-0 truncate text-foreground',
            ticket.unread ? 'text-body-strong' : 'text-body',
          )}
        >
          {ticket.subject}
        </span>
        {showPreview && (
          <span className="min-w-0 truncate text-small text-muted-foreground">
            {ticket.preview}
          </span>
        )}
      </span>
      <PriorityGlyph priority={ticket.priority} />
      <span className="w-8 shrink-0 text-right text-caption text-muted-foreground">
        {timeLabel}
      </span>
      {ticket.assignee ? (
        <Avatar name={ticket.assignee.name} src={ticket.assignee.avatarUrl} size="xs" />
      ) : (
        <span
          aria-label="Unassigned"
          className="size-5 shrink-0 rounded-full border border-dashed"
        />
      )}
    </button>
  )
}
