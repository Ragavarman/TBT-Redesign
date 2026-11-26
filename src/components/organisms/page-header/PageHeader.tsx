import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Icon, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface PageHeaderProps extends Omit<ComponentProps<'header'>, 'title'> {
  /** 16px module icon before the title. */
  icon?: IconName | LucideIcon
  /** Page title (Title). */
  title: ReactNode
  /** Count after the title (Title, muted) — e.g. the number of tickets in the view. */
  count?: ReactNode
  /** Extra inline content after the title, e.g. a breadcrumb or a status badge. */
  meta?: ReactNode
  /** Trailing buttons (md, with shortcuts). The primary action goes last. */
  actions?: ReactNode
}

/**
 * Top bar of a main panel (Figma Interface · Header). Min 52px — the same as the sidebar's
 * WorkspaceHeader (h-13), so the two header rules line up across the screen.
 */
export function PageHeader({
  icon,
  title,
  count,
  meta,
  actions,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-slot="page-header"
      className={cn('flex min-h-13 shrink-0 items-center gap-4 border-b px-4 py-2', className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {icon &&
          (typeof icon === 'string' ? (
            <Icon name={icon} size={16} className="text-foreground" />
          ) : (
            <Icon icon={icon} size={16} className="text-foreground" />
          ))}
        <h1 className="truncate text-title text-foreground">{title}</h1>
        {count !== undefined && (
          <span className="shrink-0 text-title text-muted-foreground tabular-nums">{count}</span>
        )}
        {meta}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </header>
  )
}
