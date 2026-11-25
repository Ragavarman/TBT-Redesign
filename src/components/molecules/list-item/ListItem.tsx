import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { Slot } from 'radix-ui'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface ListItemProps extends Omit<ComponentProps<'button'>, 'title' | 'children'> {
  title: ReactNode
  description?: ReactNode
  /** Leading element — Avatar, icon, glyph … */
  leading?: ReactNode
  /** Trailing element. Defaults to a chevron when the row is interactive; pass `null` to hide. */
  trailing?: ReactNode
  /** Current / selected row (muted fill, aria-current). */
  selected?: boolean
  /** Render the child (e.g. a router <Link>) with row styles. */
  asChild?: boolean
  /** Non-interactive row (renders a <div>, no hover). */
  static?: boolean
  children?: ReactElement
}

/** Two-line row for lists (Figma 08 · List item): leading · title + description · trailing. */
export function ListItem({
  title,
  description,
  leading,
  trailing,
  selected,
  asChild,
  static: isStatic,
  className,
  children,
  ...props
}: ListItemProps) {
  const Comp = asChild ? Slot.Root : isStatic ? 'div' : 'button'
  const trail =
    trailing === undefined
      ? !isStatic && <Icon name="chevron-right" size={16} className="text-muted-foreground" />
      : trailing
  return (
    <Comp
      data-slot="list-item"
      data-selected={selected || undefined}
      aria-current={selected ? 'true' : undefined}
      {...(Comp === 'button' && { type: 'button' as const })}
      className={cn(
        // optical padding: Body 14/20 + --py → 8px top, ≈13px sides. Two-line row: the leading
        // visual aligns to the title line so the space around it equals --py on all sides.
        'optical-edges flex w-full items-start rounded-md optical text-left outline-none',
        'text-body [--icon:1rem] [--lh:1.4286] [--py:calc(8em/14)]',
        !isStatic &&
          'transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
        'data-selected:bg-muted',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...(props as object)}
    >
      {leading && (
        <span data-edge className="flex h-(--e-slot) shrink-0 items-center [--edge:var(--e-slot)]">
          {leading}
        </span>
      )}
      {asChild && children ? (
        <Slot.Slottable>{children}</Slot.Slottable>
      ) : (
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-body-strong text-foreground">{title}</span>
          {description && (
            <span className="truncate text-small text-muted-foreground">{description}</span>
          )}
        </span>
      )}
      {trail && (
        <span data-edge className="flex shrink-0 items-center self-center [--edge:var(--e-slot)]">
          {trail}
        </span>
      )}
    </Comp>
  )
}
