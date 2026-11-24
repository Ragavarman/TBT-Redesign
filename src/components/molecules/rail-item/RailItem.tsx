import type { ComponentProps, ReactElement } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Slot } from 'radix-ui'
import { Icon, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { Tooltip } from '../tooltip'

export interface RailItemProps extends Omit<ComponentProps<'button'>, 'children'> {
  icon: IconName | LucideIcon
  /** Module name — accessible label and tooltip text. */
  label: string
  /** Current module: card fill + border, foreground icon. */
  active?: boolean
  /** Destructive notification dot at the top-right. */
  dot?: boolean
  /** Show the label in a tooltip on the right. Default true. */
  tooltip?: boolean
  /** Render the child (e.g. a router <Link>) with rail styles. */
  asChild?: boolean
  children?: ReactElement
}

/** Collapsed-sidebar icon button (Figma 07 · Rail item): 36×36, radius 8. */
export function RailItem({
  icon,
  label,
  active,
  dot,
  tooltip = true,
  asChild,
  className,
  children,
  ...props
}: RailItemProps) {
  const Comp = asChild ? Slot.Root : 'button'
  const item = (
    <Comp
      data-slot="rail-item"
      data-active={active || undefined}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      {...(!asChild && { type: 'button' as const })}
      className={cn(
        'relative inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-transparent',
        'text-muted-foreground transition-colors duration-150 outline-none',
        'hover:bg-accent hover:text-foreground focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        'data-active:border-border data-active:bg-card data-active:text-foreground',
        className,
      )}
      {...props}
    >
      {typeof icon === 'string' ? <Icon name={icon} size={16} /> : <Icon icon={icon} size={16} />}
      {asChild && children && <Slot.Slottable>{children}</Slot.Slottable>}
      {dot && (
        <span
          aria-hidden
          className="absolute top-1 right-1 size-2 rounded-full bg-destructive ring-2 ring-card"
        />
      )}
    </Comp>
  )
  return tooltip ? (
    <Tooltip content={label} side="right">
      {item}
    </Tooltip>
  ) : (
    item
  )
}
