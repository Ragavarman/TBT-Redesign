import type { ComponentProps, ReactNode } from 'react'
import { IconButton } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface BulkActionBarProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Number of selected items. The bar renders nothing at 0. */
  count: number
  /** Noun after the count. Default "selected" → "3 selected". */
  label?: (count: number) => ReactNode
  /** Action buttons — ghost size sm, destructive last (Figma 10 · Bulk action bar). */
  actions: ReactNode
  /** Clear the selection (the × at the end). */
  onClear: () => void
  /**
   * `floating` (default) — fixed at the bottom centre of the viewport, above content.
   * `inline` — in normal flow (e.g. inside a table toolbar).
   */
  position?: 'floating' | 'inline'
}

/**
 * Appears when rows are selected: count · divider · actions · clear. A labelled toolbar,
 * announced politely when the count changes.
 */
export function BulkActionBar({
  count,
  label = (n) => `${n} selected`,
  actions,
  onClear,
  position = 'floating',
  className,
  ...props
}: BulkActionBarProps) {
  if (count <= 0) return null
  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      data-slot="bulk-action-bar"
      className={cn(
        'flex items-center gap-2 rounded-md border bg-popover py-1.5 pr-1.5 pl-3 text-popover-foreground shadow-overlay',
        position === 'floating' &&
          'fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in duration-150 fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none',
        className,
      )}
      {...props}
    >
      <span aria-live="polite" className="text-label whitespace-nowrap">
        {label(count)}
      </span>
      <span aria-hidden className="h-4 w-px bg-border" />
      <div className="flex items-center gap-1">{actions}</div>
      <IconButton icon="x" label="Clear selection" size="sm" onClick={onClear} />
    </div>
  )
}
