import type { ComponentProps, ReactNode } from 'react'
import { StatusGlyph } from '@/components/atoms'
import { cn } from '@/lib/utils'
import type { TicketStatus } from '@/types'

export interface TicketBreadcrumbProps extends ComponentProps<'div'> {
  /** Display id, e.g. "#4821" or "T-221". */
  ticketId: ReactNode
  status: TicketStatus
  /** Where it came from, e.g. "Email · via Zendesk". */
  source?: ReactNode
}

/** Ticket header line (Figma 10 · Ticket breadcrumb): status glyph · id · source. */
export function TicketBreadcrumb({
  ticketId,
  status,
  source,
  className,
  ...props
}: TicketBreadcrumbProps) {
  return (
    <div
      data-slot="ticket-breadcrumb"
      className={cn('flex min-w-0 items-center gap-1.5', className)}
      {...props}
    >
      <StatusGlyph status={status} />
      <span className="shrink-0 text-label text-foreground">{ticketId}</span>
      {source && (
        <>
          <span aria-hidden className="text-small text-muted-foreground">
            ·
          </span>
          <span className="truncate text-small text-muted-foreground">{source}</span>
        </>
      )}
    </div>
  )
}
