import { CAPTION, FIELD } from '@/lib/optical'
import { cn } from '@/lib/utils'

/**
 * Shared look for floating surfaces and menu rows (Figma 07 · Menu content / Menu item,
 * 06 · Select "Opens a Menu content popover"). Used by dropdown-menu, select and popover.
 */

/** Open/close animation keyed to Radix data-state and data-side. */
export const floatingMotion = cn(
  'duration-100',
  'data-[side=bottom]:slide-in-from-top-1 data-[side=left]:slide-in-from-right-1',
  'data-[side=right]:slide-in-from-left-1 data-[side=top]:slide-in-from-bottom-1',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'motion-reduce:animate-none',
)

/** popover fill · border · radius 8 · Elevation/Overlay. */
export const floatingSurface = cn(
  'z-50 rounded-md border border-border bg-popover text-popover-foreground shadow-overlay outline-none',
  floatingMotion,
)

/** Menu content panel: 4px padding, min width 208. */
export const menuContent = cn(floatingSurface, 'min-w-52 overflow-x-hidden overflow-y-auto p-1')

/** Menu item row: 32px (optical: Body + --py), radius 4, 14px muted icons pulled to the edge. */
export const menuItem = cn(
  'relative flex w-full cursor-pointer items-center rounded-xs text-popover-foreground outline-none select-none',
  'optical-edges optical [--icon:14px]',
  FIELD.md,
  'focus:bg-accent data-highlighted:bg-accent',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon) [&_svg:not([class*='text-'])]:text-muted-foreground",
  // destructive rows: label + icon in destructive, soft tint on hover
  'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive-soft data-[variant=destructive]:data-highlighted:bg-destructive-soft',
  'data-[variant=destructive]:[&_svg]:text-destructive',
)

/** Section label inside a menu: 28px (optical: Caption + --py), muted. */
export const menuLabel = cn('flex items-center optical text-muted-foreground', CAPTION.lg)

/** 1px divider with 4px above and below (9px total, as in Figma). */
export const menuSeparator = 'my-1 h-px bg-border'

/** Trailing shortcut hint: Caption, muted. */
export const menuShortcut = 'ml-auto pl-4 text-caption text-muted-foreground'
