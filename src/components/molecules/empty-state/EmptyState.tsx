import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'

export type EmptyStateType = 'empty' | 'no-results' | 'error' | 'no-access' | 'offline'

const PRESET: Record<EmptyStateType, IconName> = {
  empty: 'inbox',
  'no-results': 'search',
  error: 'warning',
  'no-access': 'lock',
  offline: 'wifi',
}

export interface EmptyStateProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Picks the default icon and tint (error is destructive). Default `empty`. */
  type?: EmptyStateType
  /** Override the preset icon. */
  icon?: IconName | LucideIcon
  title: ReactNode
  description?: ReactNode
  /** Primary way forward — a Button (sm). Primary for "empty", outline for recovery states. */
  action?: ReactNode
}

/**
 * Placeholder when there's nothing to show (Figma 09 · Empty state):
 * 40px icon tile · Title · Small description · action. Always say what happened and what to do next.
 */
export function EmptyState({
  type = 'empty',
  icon,
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const glyph = icon ?? PRESET[type]
  const error = type === 'error'
  return (
    <div
      data-slot="empty-state"
      data-type={type}
      className={cn('flex flex-col items-center gap-3 px-6 py-8 text-center', className)}
      {...props}
    >
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          error ? 'bg-destructive-soft text-destructive' : 'border bg-muted text-muted-foreground',
        )}
      >
        {typeof glyph === 'string' ? (
          <Icon name={glyph} size={20} />
        ) : (
          <Icon icon={glyph} size={20} />
        )}
      </div>
      <div className="flex max-w-80 flex-col gap-1">
        <p className="text-title text-foreground">{title}</p>
        {description && <p className="text-small text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
