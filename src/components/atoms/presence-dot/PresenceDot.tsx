import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type Presence = 'online' | 'away' | 'offline'

const PRESENCE = {
  online: { className: 'bg-success', label: 'Online' },
  away: { className: 'bg-warning', label: 'Away' },
  offline: { className: 'bg-muted-foreground', label: 'Offline' },
} as const

export interface PresenceDotProps extends Omit<ComponentProps<'span'>, 'children'> {
  state: Presence
  /** Accessible label. Defaults to "Online" / "Away" / "Offline"; pass `null` when a nearby label already says it. */
  label?: string | null
}

/** 8px availability dot with a 2px `card` ring so it reads on top of avatars (Figma 08 · Presence dot). */
export function PresenceDot({ state, label, className, ...props }: PresenceDotProps) {
  const p = PRESENCE[state]
  const name = label === undefined ? p.label : label
  return (
    <span
      data-slot="presence-dot"
      data-state={state}
      role={name ? 'img' : undefined}
      aria-label={name ?? undefined}
      aria-hidden={name ? undefined : true}
      className={cn(
        'inline-block size-2 shrink-0 rounded-full ring-2 ring-card',
        p.className,
        className,
      )}
      {...props}
    />
  )
}
