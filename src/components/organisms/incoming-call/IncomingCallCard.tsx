import { useEffect, useState, type ComponentProps } from 'react'
import { Avatar, Button, StatusGlyph } from '@/components/atoms'
import { cn } from '@/lib/utils'
import type { TicketStatus } from '@/types'

export interface IncomingCallCardProps extends Omit<ComponentProps<'section'>, 'title'> {
  caller: { name: string; phone: string; avatarUrl?: string }
  /** "VIP · Frequent caller". */
  tags?: string[]
  /** "RingCentral · main line". */
  source: string
  /** The caller's open tickets; the first one gets the primary "Open" button. */
  openTickets: { id: number; label: string; subject: string; status: TicketStatus }[]
  onOpenTicket: (id: number) => void
  onNewTicket: () => void
  onDismiss: () => void
  /** Ring time already elapsed (seconds); the card counts up from here. */
  startedSeconds?: number
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

/**
 * Incoming call notice (Figma Interface · X11): who's calling, how long it's been ringing, their
 * open tickets, and one-click Open / New ticket / Dismiss. Floats bottom-right over the page and
 * is announced to screen readers.
 */
export function IncomingCallCard({
  caller,
  tags = [],
  source,
  openTickets,
  onOpenTicket,
  onNewTicket,
  onDismiss,
  startedSeconds = 0,
  className,
  ...props
}: IncomingCallCardProps) {
  const [seconds, setSeconds] = useState(startedSeconds)
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const first = openTickets[0]

  return (
    <section
      role="alertdialog"
      aria-label={`Incoming call from ${caller.name}`}
      aria-describedby="incoming-call-detail"
      data-slot="incoming-call"
      onKeyDown={(e) => e.key === 'Escape' && onDismiss()}
      className={cn(
        'fixed right-4 bottom-4 z-40 flex w-96 flex-col gap-3 rounded-xl border bg-popover p-4 text-popover-foreground shadow-overlay',
        'animate-in duration-200 fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none',
        className,
      )}
      {...props}
    >
      <header className="flex items-center gap-2 text-small">
        <span
          aria-hidden
          className="size-2 animate-pulse rounded-full bg-primary motion-reduce:animate-none"
        />
        <span className="text-label text-foreground">Incoming call</span>
        <span className="min-w-0 flex-1 truncate text-muted-foreground">· {source}</span>
        <span
          className="shrink-0 text-muted-foreground tabular-nums"
          aria-label={`Ringing for ${seconds} seconds`}
        >
          {clock(seconds)}
        </span>
      </header>

      <div id="incoming-call-detail" className="flex items-center gap-3">
        <Avatar name={caller.name} src={caller.avatarUrl} size="lg" aria-hidden />
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate text-title text-foreground">{caller.name}</h2>
          <p className="truncate text-small text-muted-foreground">
            {[caller.phone, ...tags].join(' · ')}
          </p>
        </div>
      </div>

      {openTickets.length > 0 && (
        <div className="flex flex-col gap-1.5 rounded-md bg-muted px-3 py-2.5">
          <h3 className="text-caption text-muted-foreground">
            {openTickets.length} open {openTickets.length === 1 ? 'ticket' : 'tickets'}
          </h3>
          <ul className="flex flex-col gap-1">
            {openTickets.slice(0, 3).map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => onOpenTicket(t.id)}
                  className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-xs text-left text-small text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <StatusGlyph status={t.status} />
                  <span className="shrink-0 tabular-nums">{t.label}</span>
                  <span className="min-w-0 truncate">{t.subject}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="flex items-center gap-2">
        {first && (
          <Button size="sm" autoFocus onClick={() => onOpenTicket(first.id)}>
            Open {first.label}
          </Button>
        )}
        <Button size="sm" variant={first ? 'secondary' : 'primary'} onClick={onNewTicket}>
          New ticket
        </Button>
        <span className="flex-1" />
        <Button size="sm" variant="ghost" onClick={onDismiss}>
          Dismiss
        </Button>
      </footer>
    </section>
  )
}
