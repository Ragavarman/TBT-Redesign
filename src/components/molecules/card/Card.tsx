import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Header title (Title style). Omit for a headerless card. */
  title?: ReactNode
  /** Line under the title (Small, muted). */
  description?: ReactNode
  /** Top-right control — usually an IconButton with a DropdownMenu. */
  action?: ReactNode
  /** Footer on a muted strip, right-aligned — e.g. Cancel (outline) + Save (primary), size sm. */
  footer?: ReactNode
  /** Remove the body padding (for tables / lists that run edge to edge). */
  flush?: boolean
}

/**
 * Surface for grouped content (Figma 08 · Card): card fill, border, radius 12;
 * 16px header and body padding; optional muted footer.
 */
export function Card({
  title,
  description,
  action,
  footer,
  flush,
  className,
  children,
  ...props
}: CardProps) {
  const header = title !== undefined || action !== undefined
  return (
    <section
      data-slot="card"
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground',
        className,
      )}
      {...props}
    >
      {header && (
        <header className="flex items-start gap-2 px-4 pt-4 pb-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            {title !== undefined && <h3 className="text-title text-card-foreground">{title}</h3>}
            {description && <p className="text-small text-muted-foreground">{description}</p>}
          </div>
          {action && <div className="-my-1 -mr-1.5 shrink-0">{action}</div>}
        </header>
      )}
      {children !== undefined && (
        <div className={cn('flex-1', !flush && 'px-4 pb-4', !flush && !header && 'pt-4')}>
          {children}
        </div>
      )}
      {footer && (
        <footer className="flex items-center justify-end gap-2 border-t bg-muted px-4 py-3">
          {footer}
        </footer>
      )}
    </section>
  )
}
