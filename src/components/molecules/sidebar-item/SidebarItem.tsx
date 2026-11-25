import { isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Slot } from 'radix-ui'
import { Icon, IconButton, type IconName } from '@/components/atoms'
import { FIELD } from '@/lib/optical'
import { cn } from '@/lib/utils'

export interface SidebarItemProps extends Omit<ComponentProps<'button'>, 'children'> {
  /** Item text (Body; Body strong when active). */
  label: ReactNode
  /** TBT icon name, Lucide icon, or an element such as <StatusGlyph /> for saved views. */
  icon?: IconName | LucideIcon | ReactElement
  /** Count at the end (Small, muted). */
  count?: ReactNode
  /** Primary dot before the count — the view has unread activity. */
  unread?: boolean
  /** 0 — module (18px icon) · 1 — nested saved view (indented, 16px icon). */
  level?: 0 | 1
  /** Current page. Sets aria-current="page" and the sidebar-accent fill. */
  active?: boolean
  /** Render the child (e.g. a router <Link>) with item styles. */
  asChild?: boolean
  children?: ReactElement
}

function renderIcon(icon: SidebarItemProps['icon'], size: 16 | 18) {
  if (icon === undefined) return null
  if (isValidElement(icon)) return icon
  return typeof icon === 'string' ? (
    <Icon name={icon} size={size} />
  ) : (
    <Icon icon={icon as LucideIcon} size={size} />
  )
}

/** Sidebar navigation row (Figma 07 · Sidebar item). */
export function SidebarItem({
  label,
  icon,
  count,
  unread,
  level = 0,
  active,
  asChild,
  className,
  children,
  ...props
}: SidebarItemProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="sidebar-item"
      data-active={active || undefined}
      data-level={level}
      aria-current={active ? 'page' : undefined}
      {...(!asChild && { type: 'button' as const })}
      className={cn(
        // optical padding: Body + --py → 32px; the icon is pulled to the edge
        'group/sidebar-item optical-edges flex w-full items-center rounded-sm optical text-left text-sidebar-foreground outline-none',
        FIELD.md,
        'transition-colors duration-150',
        // level 0: 18px icon inside the 20px slot. level 1 (saved views) is indented one icon column.
        level === 0 ? '[--icon:1.125rem]' : 'ps-[calc(var(--px)+1.5rem)]! [--icon:1rem]',
        'hover:bg-muted focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        'data-active:bg-sidebar-accent data-active:text-body-strong data-active:text-sidebar-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
        // level-0 icons are muted until active; level-1 icons (often glyphs) keep their own colour
        level === 0 &&
          '[&>[data-slot=icon]]:text-muted-foreground data-active:[&>[data-slot=icon]]:text-sidebar-accent-foreground',
        className,
      )}
      {...props}
    >
      {renderIcon(icon, level === 0 ? 18 : 16)}
      {asChild && children ? (
        <Slot.Slottable>{children}</Slot.Slottable>
      ) : (
        <span className="min-w-0 flex-1 truncate">{label}</span>
      )}
      {unread && (
        <span
          aria-label="Unread"
          role="img"
          className="size-1.5 shrink-0 rounded-full bg-primary"
        />
      )}
      {count !== undefined && (
        <span className="shrink-0 text-small text-muted-foreground tabular-nums">{count}</span>
      )}
    </Comp>
  )
}

export interface SidebarGroupLabelProps extends Omit<ComponentProps<'div'>, 'children'> {
  label: ReactNode
  /** Makes the label a toggle with a chevron. Pair with `open` / `onOpenChange`. */
  collapsible?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Trailing + button, e.g. "New view". */
  action?: { label: string; onClick: () => void; icon?: IconName }
}

/** Section heading inside the sidebar (Figma 07 · Sidebar group label): Caption, muted, 28px. */
export function SidebarGroupLabel({
  label,
  collapsible,
  open = true,
  onOpenChange,
  action,
  className,
  ...props
}: SidebarGroupLabelProps) {
  return (
    <div
      data-slot="sidebar-group-label"
      className={cn(
        'flex h-7 items-center gap-1 px-2 text-caption text-muted-foreground',
        className,
      )}
      {...props}
    >
      {collapsible ? (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => onOpenChange?.(!open)}
          className="-mx-1 flex min-w-0 flex-1 items-center gap-1 rounded-xs px-1 text-left outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <span className="truncate">{label}</span>
          <Icon
            name="chevron-down"
            size={12}
            className={cn('transition-transform duration-150', !open && '-rotate-90')}
          />
        </button>
      ) : (
        <span className="min-w-0 flex-1 truncate">{label}</span>
      )}
      {action && (
        <IconButton
          icon={action.icon ?? 'plus'}
          label={action.label}
          size="sm"
          onClick={action.onClick}
          className="-mr-1.5 size-6"
        />
      )}
    </div>
  )
}
