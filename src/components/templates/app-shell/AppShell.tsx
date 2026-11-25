import type { ComponentProps, ReactNode } from 'react'
import { rem } from '@/lib/units'
import { cn } from '@/lib/utils'

export interface AppShellProps extends ComponentProps<'div'> {
  /** The app sidebar: usually an organisms <Sidebar /> (296 expanded, 56 collapsed). */
  sidebar: ReactNode
  /** One or more <Panel />s, laid out left to right. */
  children: ReactNode
}

/**
 * Full-viewport frame for every screen (Figma Interface · 1440×900): background fill,
 * 8px inset, sidebar + panels with 8px gaps. Panels share the remaining width.
 */
export function AppShell({ sidebar, className, children, ...props }: AppShellProps) {
  return (
    <div
      data-slot="app-shell"
      className={cn(
        'flex h-dvh min-h-0 gap-2 overflow-hidden bg-background p-2 text-foreground',
        className,
      )}
      {...props}
    >
      {sidebar}
      <main className="flex min-w-0 flex-1 gap-2">{children}</main>
    </div>
  )
}

export interface PanelProps extends ComponentProps<'section'> {
  /** Fixed width in px (list 320, details 300). Omit to fill the remaining space. */
  width?: number
  /**
   * card — the default card surface with a border ·
   * plain — no surface, for a column of stacked cards (e.g. the ticket details column).
   */
  surface?: 'card' | 'plain'
}

/** One column of the shell: a rounded card that clips its content and fills the height. */
export function Panel({ width, surface = 'card', className, style, ...props }: PanelProps) {
  return (
    <section
      data-slot="panel"
      className={cn(
        'flex min-h-0 min-w-0 flex-col',
        width === undefined && 'flex-1',
        width !== undefined && 'shrink-0',
        surface === 'card' && 'overflow-hidden rounded-xl border bg-card text-card-foreground',
        surface === 'plain' && 'gap-2 overflow-y-auto',
        className,
      )}
      style={width === undefined ? style : { width: rem(width), ...style }}
      {...props}
    />
  )
}

/** Scrolling region inside a panel. Takes the space left after headers and toolbars. */
export function PanelBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="panel-body"
      className={cn('min-h-0 flex-1 overflow-y-auto', className)}
      {...props}
    />
  )
}
