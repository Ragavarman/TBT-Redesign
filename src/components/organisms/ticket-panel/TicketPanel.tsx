import { useId, useState, type ComponentProps, type ReactNode } from 'react'
import { Avatar, Icon, StatusGlyph } from '@/components/atoms'
import { cn } from '@/lib/utils'
import type { TicketStatus } from '@/types'

/* ── PanelSection ─────────────────────────────────────────────────────────── */

export interface PanelSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Section label (Label, muted), e.g. "Properties", "Linked". */
  title: ReactNode
  /** Trailing control in the header (e.g. a + IconButton). */
  action?: ReactNode
  /** Collapsible via the header. Default true. */
  collapsible?: boolean
  defaultOpen?: boolean
  children: ReactNode
}

/** Ticket side-panel section (Figma 10 · Panel section header): 36px header + content. */
export function PanelSection({
  title,
  action,
  collapsible = true,
  defaultOpen = true,
  className,
  children,
  ...props
}: PanelSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()
  return (
    <section
      data-slot="panel-section"
      className={cn('flex flex-col border-b last:border-b-0', className)}
      {...props}
    >
      <div className="flex h-9 items-center gap-2">
        {collapsible ? (
          <button
            type="button"
            aria-expanded={open}
            aria-controls={id}
            onClick={() => setOpen((o) => !o)}
            className="flex min-w-0 flex-1 items-center gap-2 rounded-xs text-left text-label text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0 flex-1 truncate">{title}</span>
            <Icon
              name="chevron-down"
              size={12}
              className={cn('transition-transform duration-150', !open && '-rotate-90')}
            />
          </button>
        ) : (
          <span className="min-w-0 flex-1 truncate text-label text-muted-foreground">{title}</span>
        )}
        {action}
      </div>
      <div id={id} hidden={!open} className="pb-3">
        {children}
      </div>
    </section>
  )
}

/* ── LinkedTicketRow ──────────────────────────────────────────────────────── */

export interface LinkedTicketRowProps extends Omit<ComponentProps<'a'>, 'children' | 'title'> {
  status: TicketStatus
  /** e.g. "#4812 Shared drive permissions reset". */
  title: ReactNode
  timeLabel: string
}

/** Related / merged ticket link (Figma 10 · Linked ticket row): 28px, radius 6. */
export function LinkedTicketRow({
  status,
  title,
  timeLabel,
  className,
  ...props
}: LinkedTicketRowProps) {
  return (
    <a
      data-slot="linked-ticket-row"
      className={cn(
        '-mx-2 flex h-7 cursor-pointer items-center gap-2 rounded-sm px-2 outline-none',
        'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      <StatusGlyph status={status} />
      <span className="min-w-0 flex-1 truncate text-small text-foreground">{title}</span>
      <span className="shrink-0 text-caption text-muted-foreground">{timeLabel}</span>
    </a>
  )
}

/* ── ActivityItem ─────────────────────────────────────────────────────────── */

export interface ActivityItemProps extends ComponentProps<'li'> {
  /** Leading glyph — usually a StatusGlyph; defaults to the status of the change. */
  status?: TicketStatus
  icon?: ReactNode
  children: ReactNode
  timeLabel: string
}

/** Compact one-line event for the side panel (Figma 10 · Activity item). Render inside a <ul>. */
export function ActivityItem({
  status,
  icon,
  children,
  timeLabel,
  className,
  ...props
}: ActivityItemProps) {
  return (
    <li
      data-slot="activity-item"
      className={cn('flex min-w-0 items-center gap-2 py-1', className)}
      {...props}
    >
      {icon ??
        (status ? <StatusGlyph status={status} label={null} /> : <span className="size-4" />)}
      <span className="min-w-0 truncate text-small text-foreground">{children}</span>
      <span className="shrink-0 text-caption text-muted-foreground">· {timeLabel}</span>
    </li>
  )
}

/* ── InternalNote ─────────────────────────────────────────────────────────── */

export interface InternalNoteProps extends ComponentProps<'article'> {
  author: { name: string; avatarUrl?: string }
  timeLabel: string
  children: ReactNode
}

/**
 * Agent-only note in the conversation (Figma 10 · Internal note): info-soft card with author,
 * body and a “Not visible to customer” footer.
 */
export function InternalNote({
  author,
  timeLabel,
  children,
  className,
  ...props
}: InternalNoteProps) {
  return (
    <article
      data-slot="internal-note"
      aria-label={`Internal note from ${author.name}`}
      className={cn('flex flex-col gap-1.5 rounded-md bg-info-soft px-4 py-3', className)}
      {...props}
    >
      <header className="flex items-center gap-1.5">
        <Avatar name={author.name} src={author.avatarUrl} size="xs" aria-hidden />
        <span className="text-label text-foreground">{author.name} left a note</span>
        <span className="text-caption text-muted-foreground">· {timeLabel}</span>
      </header>
      <div className="text-body text-foreground">{children}</div>
      <footer className="flex items-center gap-1 text-caption text-muted-foreground">
        <Icon name="lock" size={12} />
        Not visible to customer
      </footer>
    </article>
  )
}
