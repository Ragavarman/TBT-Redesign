import type { ComponentProps } from 'react'
import { Avatar, Badge, PriorityGlyph, StatusGlyph } from '@/components/atoms'
import { SlaBadge } from '@/components/molecules'
import { cn } from '@/lib/utils'
import { formatTicketId, type Ticket } from '@/types'

export type TicketRowProperty =
  'id' | 'customer' | 'priority' | 'sla' | 'assignee' | 'labels' | 'updated'

const DEFAULT_PROPERTIES: TicketRowProperty[] = [
  'customer',
  'id',
  'priority',
  'updated',
  'assignee',
]

export interface TicketRowProps extends Omit<ComponentProps<'button'>, 'children'> {
  ticket: Ticket
  /** Short relative time, e.g. "1d". */
  timeLabel: string
  selected?: boolean
  /** Show the preview after the subject. Default true. */
  showPreview?: boolean
  /** Which properties the row shows (Figma X4 · Properties shown on rows). */
  properties?: TicketRowProperty[]
  /** comfortable 40px (default) · compact 32px. */
  density?: 'comfortable' | 'compact'
  /** Customer text; defaults to the requester's name. */
  customerLabel?: string
}

/**
 * Dense ticket row for wide lists (Figma 10 · Ticket row):
 * status · customer · id · subject + preview · labels · SLA · priority · time · assignee.
 */
export function TicketRow({
  ticket,
  timeLabel,
  selected,
  showPreview = true,
  properties = DEFAULT_PROPERTIES,
  density = 'comfortable',
  customerLabel,
  className,
  ...props
}: TicketRowProps) {
  const show = (p: TicketRowProperty) => properties.includes(p)
  const sla = ticket.sla && ticket.sla.state !== 'on-track' ? ticket.sla : undefined
  return (
    <button
      type="button"
      data-slot="ticket-row"
      data-selected={selected || undefined}
      data-density={density}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'flex w-full items-center gap-3 border-b bg-background px-4 text-left outline-none',
        density === 'compact' ? 'h-8' : 'h-10',
        'transition-colors duration-150 hover:bg-accent data-selected:bg-muted',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        className,
      )}
      {...props}
    >
      <StatusGlyph status={ticket.status} />
      {show('customer') && (
        <span className="w-40 shrink-0 truncate text-body text-foreground">
          {customerLabel ?? ticket.requester.name}
        </span>
      )}
      {show('id') && (
        <span className="w-13 shrink-0 text-small text-muted-foreground tabular-nums">
          {formatTicketId(ticket.id)}
        </span>
      )}
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
      {show('labels') &&
        ticket.tags.map((tag) => (
          <Badge key={tag} variant="outline" className="shrink-0">
            {tag}
          </Badge>
        ))}
      {show('sla') && sla && <SlaBadge state={sla.state}>{sla.label}</SlaBadge>}
      {show('priority') && <PriorityGlyph priority={ticket.priority} />}
      {show('updated') && (
        <span className="w-8 shrink-0 text-right text-caption text-muted-foreground">
          {timeLabel}
        </span>
      )}
      {show('assignee') &&
        (ticket.assignee ? (
          <Avatar name={ticket.assignee.name} src={ticket.assignee.avatarUrl} size="xs" />
        ) : (
          <span
            aria-label="Unassigned"
            className="size-5 shrink-0 rounded-full border border-dashed"
          />
        ))}
    </button>
  )
}
