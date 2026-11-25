import type { ComponentProps } from 'react'
import { Avatar, StatusGlyph } from '@/components/atoms'
import { PriorityBadge } from '@/components/molecules'
import { cn } from '@/lib/utils'
import { formatTicketId, type Ticket } from '@/types'

export interface TicketListItemProps extends Omit<ComponentProps<'button'>, 'children'> {
  ticket: Ticket
  /** Short relative time, e.g. "2h". Formatting is the caller's job. */
  timeLabel: string
  /** Currently open ticket: muted fill + primary bar, aria-current. */
  selected?: boolean
  /** Show the one-line message preview. Default true. */
  showPreview?: boolean
}

/**
 * Inbox list row (Figma 10 · Ticket list item): status · subject · time, then
 * #id · requester · priority · assignee, then a preview line. Unread tickets get a bold
 * subject and a primary dot.
 */
export function TicketListItem({
  ticket,
  timeLabel,
  selected,
  showPreview = true,
  className,
  ...props
}: TicketListItemProps) {
  const { unread } = ticket
  return (
    <button
      type="button"
      data-slot="ticket-list-item"
      data-selected={selected || undefined}
      data-unread={unread || undefined}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'relative flex w-full flex-col gap-1 border-b bg-background px-4 py-3 text-left outline-none',
        'transition-colors duration-150 hover:bg-accent',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        'data-selected:bg-muted',
        // Figma "Active bar"
        'before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary before:opacity-0 data-selected:before:opacity-100',
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 items-center gap-2">
        <StatusGlyph status={ticket.status} />
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-foreground',
            unread ? 'text-body-strong' : 'text-body',
          )}
        >
          {ticket.subject}
        </span>
        {unread && (
          <span
            role="img"
            aria-label="Unread"
            className="size-1.5 shrink-0 rounded-full bg-primary"
          />
        )}
        <span className="shrink-0 text-caption text-muted-foreground">{timeLabel}</span>
      </span>
      <span className="flex min-w-0 items-center gap-1.5 text-caption text-muted-foreground">
        <span className="shrink-0">{formatTicketId(ticket.id)}</span>
        <span aria-hidden>·</span>
        <span className="min-w-0 flex-1 truncate">{ticket.requester.name}</span>
        <PriorityBadge priority={ticket.priority} />
        {ticket.assignee ? (
          <Avatar name={ticket.assignee.name} src={ticket.assignee.avatarUrl} size="xs" />
        ) : (
          <span className="sr-only">Unassigned</span>
        )}
      </span>
      {showPreview && (
        <span className="truncate text-small text-muted-foreground">{ticket.preview}</span>
      )}
    </button>
  )
}
