import { useId, type ComponentProps, type ReactNode } from 'react'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface PropertyRowProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Property name (Small, muted, 104px column — fits "Customer since"). */
  label: ReactNode
  /** The value — text, TicketStatusBadge, PriorityBadge, Avatar + name, Badges, SlaBadge … */
  children?: ReactNode
  /**
   * Empty-value call to action (Figma type=action): “+ Add …” in muted text.
   * Shown when there are no children.
   */
  action?: { label: string; onClick: () => void }
}

/**
 * Label / value row for the ticket properties panel (Figma 10 · Property row): 32px min height,
 * 96px label column, 8px gap. Stack rows inside a Card or panel section.
 */
export function PropertyRow({ label, children, action, className, ...props }: PropertyRowProps) {
  const id = useId()
  const empty = children === undefined || children === null || children === false
  return (
    <div
      data-slot="property-row"
      role="group"
      aria-labelledby={id}
      className={cn('grid min-h-8 grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-2', className)}
      {...props}
    >
      <span id={id} className="truncate text-small text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5 text-small text-foreground">
        {empty && action ? (
          <button
            type="button"
            onClick={action.onClick}
            className="-mx-1 inline-flex items-center gap-1.5 rounded-xs px-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon name="plus" size={12} />
            {action.label}
          </button>
        ) : empty ? (
          <span className="text-muted-foreground">—</span>
        ) : (
          children
        )}
      </div>
    </div>
  )
}
