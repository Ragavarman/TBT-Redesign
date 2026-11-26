import type { ComponentProps, ReactNode } from 'react'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface ChartCardProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Card title (Title). */
  title: ReactNode
  /** Context after a slash (Small, muted), e.g. "Daily · Nov 11 – 18". */
  meta?: ReactNode
  /** Right side of the header — a callout, a legend or a menu. */
  action?: ReactNode
  /** Footer strip under the plot, usually a <ChartLegend /> and a <ChartNote />. */
  footer?: ReactNode
  /** Remove the body padding (tables that run edge to edge). */
  flush?: boolean
}

/**
 * Card that frames a chart or a breakdown (Figma Interface · Reports): header with
 * Title / meta, padded body, optional bordered footer.
 */
export function ChartCard({
  title,
  meta,
  action,
  footer,
  flush,
  className,
  children,
  ...props
}: ChartCardProps) {
  return (
    <section
      data-slot="chart-card"
      className={cn(
        'flex min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-card-foreground',
        className,
      )}
      {...props}
    >
      <header className="flex min-h-13 items-center gap-2 border-b px-5 py-3">
        <h2 className="shrink-0 text-title text-card-foreground">{title}</h2>
        {meta && (
          <>
            <span aria-hidden className="text-small text-muted-foreground">
              /
            </span>
            <span className="min-w-0 truncate text-small text-muted-foreground">{meta}</span>
          </>
        )}
        <span className="flex-1" />
        {action}
      </header>
      <div className={cn('flex-1', !flush && 'p-5')}>{children}</div>
      {footer && (
        <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t px-5 py-3">
          {footer}
        </footer>
      )}
    </section>
  )
}

export interface ChartLegendItem {
  label: ReactNode
  /** Swatch fill: a bg-* class, e.g. "bg-success". */
  swatch: string
}

/** Legend row: 8px rounded swatches + Caption labels. */
export function ChartLegend({
  items,
  className,
  ...props
}: ComponentProps<'ul'> & { items: ChartLegendItem[] }) {
  return (
    <ul
      data-slot="chart-legend"
      className={cn('flex flex-wrap items-center gap-x-4 gap-y-1', className)}
      {...props}
    >
      {items.map((item, i) => (
        <li key={i} className="flex items-center gap-1.5 text-caption text-muted-foreground">
          <span aria-hidden className={cn('size-2 shrink-0 rounded-[2px]', item.swatch)} />
          {item.label}
        </li>
      ))}
    </ul>
  )
}

/** Small muted note with an info icon, e.g. "Illustrative values". Pushes itself to the right. */
export function ChartNote({ className, children, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="chart-note"
      className={cn(
        'ms-auto flex items-center gap-1 text-caption text-muted-foreground',
        className,
      )}
      {...props}
    >
      <Icon name="info" size={12} />
      {children}
    </p>
  )
}

/** Header callout: dot + Overline text, e.g. "Peak · Nov 17". */
export function ChartCallout({
  swatch = 'bg-primary',
  className,
  children,
  ...props
}: ComponentProps<'p'> & { swatch?: string }) {
  return (
    <p
      data-slot="chart-callout"
      className={cn('flex items-center gap-1.5 text-overline text-muted-foreground', className)}
      {...props}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', swatch)} />
      {children}
    </p>
  )
}
