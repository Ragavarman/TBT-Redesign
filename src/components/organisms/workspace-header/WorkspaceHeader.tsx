import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface WorkspaceHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  /** Workspace or module name (Title). */
  title: ReactNode
  /** Optional line under the title (Caption, muted). */
  subtitle?: ReactNode
  /** Trailing ghost icon buttons, e.g. search + new. */
  actions?: ReactNode
}

/** Top of the sub-navigation (Figma 07 · Workspace header): 52px, bottom border. */
export function WorkspaceHeader({
  title,
  subtitle,
  actions,
  className,
  ...props
}: WorkspaceHeaderProps) {
  return (
    <div
      data-slot="workspace-header"
      className={cn(
        'flex h-13 shrink-0 items-center gap-2 border-b border-sidebar-border px-4',
        className,
      )}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-title text-sidebar-foreground">{title}</span>
        {subtitle && (
          <span className="truncate text-caption text-muted-foreground">{subtitle}</span>
        )}
      </div>
      {actions && <div className="-mr-1.5 flex shrink-0 items-center gap-0.5">{actions}</div>}
    </div>
  )
}
