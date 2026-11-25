import type { ComponentProps, ReactNode } from 'react'
import { Avatar } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface TimelineDayProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** "Today", "Yesterday", "Nov 18" (Caption, muted). */
  label: ReactNode
  /** <TimelineEntry />s, newest first. */
  children: ReactNode
}

/** One day of the full ticket timeline (Figma Interface · T3 Full timeline). */
export function TimelineDay({ label, children, className, ...props }: TimelineDayProps) {
  return (
    <section data-slot="timeline-day" className={cn('flex flex-col gap-1', className)} {...props}>
      <h3 className="text-caption text-muted-foreground">{label}</h3>
      <ol className="flex flex-col">{children}</ol>
    </section>
  )
}

export interface TimelineEntryProps extends Omit<ComponentProps<'li'>, 'title'> {
  /** Clock time, e.g. "10:05". */
  time: string
  /** Absolute timestamp for the <time> element (ISO). */
  dateTime?: string
  /** Who did it — drives the avatar initials ("System" → SY). */
  actor: { name: string; avatarUrl?: string }
  /** "Tharsi added an internal note" (Body). */
  title: ReactNode
  /** Second line (Small, muted): a quote, "Medium → Urgent", "3 min 12 s · recorded". */
  detail?: ReactNode
}

/** One timeline row: time · actor avatar · what happened, with an optional detail line. */
export function TimelineEntry({
  time,
  dateTime,
  actor,
  title,
  detail,
  className,
  ...props
}: TimelineEntryProps) {
  return (
    <li
      data-slot="timeline-entry"
      className={cn('flex items-center gap-3 py-3', className)}
      {...props}
    >
      <time
        dateTime={dateTime}
        className="w-10 shrink-0 text-end text-small text-muted-foreground tabular-nums"
      >
        {time}
      </time>
      <Avatar name={actor.name} src={actor.avatarUrl} size="xs" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="truncate text-body text-foreground">{title}</p>
        {detail && <p className="truncate text-small text-muted-foreground">{detail}</p>}
      </div>
    </li>
  )
}
