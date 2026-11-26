import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Avatar, Icon, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'

export type TimelineEventType = 'comment' | 'status' | 'assignment' | 'system'

const MARKER_ICON: Record<Exclude<TimelineEventType, 'comment'>, IconName> = {
  status: 'layers',
  assignment: 'user',
  system: 'info',
}

export interface TimelineEventProps extends Omit<ComponentProps<'li'>, 'children'> {
  /** comment — avatar + message card · status / assignment / system — small icon marker, one line. */
  type: TimelineEventType
  /** Who did it (Label). Omit for system events without an actor. */
  actor?: ReactNode
  /** Photo for the comment avatar (falls back to initials of `actorName`). */
  avatarSrc?: string
  /** Plain-text name for the avatar initials when `actor` is not a string. */
  actorName?: string
  /** What happened (Small, muted), e.g. "replied", "changed status to", "assigned to". */
  action: ReactNode
  /** Inline object after the action — a TicketStatusBadge, a person's name … */
  target?: ReactNode
  /** Relative time, e.g. "2h ago". Put the absolute time in `timeTitle`. */
  time: ReactNode
  /** Absolute timestamp shown on hover (and as the <time> dateTime when ISO). */
  timeTitle?: string
  /** Override the marker icon for non-comment events. */
  icon?: IconName | LucideIcon
  /** Message body for comments (Body text in a bordered card). */
  children?: ReactNode
  /** Last event — hides the connecting line below the marker. */
  last?: boolean
}

/**
 * One entry in the ticket activity feed (Figma 10 · Timeline event).
 * Render inside an <ol> so the feed reads as an ordered list.
 */
export function TimelineEvent({
  type,
  actor,
  avatarSrc,
  actorName,
  action,
  target,
  time,
  timeTitle,
  icon,
  children,
  last,
  className,
  ...props
}: TimelineEventProps) {
  const comment = type === 'comment'
  const markerIcon = icon ?? (comment ? undefined : MARKER_ICON[type])
  const name = actorName ?? (typeof actor === 'string' ? actor : undefined)
  return (
    <li
      data-slot="timeline-event"
      data-type={type}
      className={cn('flex gap-3', className)}
      {...props}
    >
      <div className="flex w-5 shrink-0 flex-col items-center gap-1">
        {comment ? (
          <Avatar size="xs" name={name} src={avatarSrc} />
        ) : (
          <span className="flex size-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {markerIcon &&
              (typeof markerIcon === 'string' ? (
                <Icon name={markerIcon} size={12} />
              ) : (
                <Icon icon={markerIcon} size={12} />
              ))}
          </span>
        )}
        {!last && <span aria-hidden className="w-px flex-1 bg-border" />}
      </div>
      <div className={cn('flex min-w-0 flex-1 flex-col gap-1.5', last ? 'pb-0' : 'pb-4')}>
        <p className="flex min-h-5 flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {actor && <span className="text-label text-foreground">{actor}</span>}
          <span className="text-small text-muted-foreground">{action}</span>
          {target && <span className="inline-flex text-label text-foreground">{target}</span>}
          <time
            dateTime={timeTitle}
            title={timeTitle}
            className="text-caption text-muted-foreground"
          >
            · {time}
          </time>
        </p>
        {comment && children && (
          <div className="rounded-md border bg-card p-3 text-body text-card-foreground">
            {children}
          </div>
        )}
      </div>
    </li>
  )
}
