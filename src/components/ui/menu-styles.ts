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

/** Menu item row: 32px, radius 4, px 8, gap 8, Body text, 14px muted icons, accent on hover/focus. */
export const menuItem = cn(
  'relative flex h-8 w-full cursor-pointer items-center gap-2 rounded-xs px-2 text-body text-popover-foreground outline-none select-none',
  'focus:bg-accent data-highlighted:bg-accent',
  'data-disabled:pointer-events-none data-disabled:opacity-50',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='text-'])]:text-muted-foreground",
  // destructive rows: label + icon in destructive, soft tint on hover
  'data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive-soft data-[variant=destructive]:data-highlighted:bg-destructive-soft',
  'data-[variant=destructive]:[&_svg]:text-destructive',
)

/** Section label inside a menu: 28px, Caption, muted. */
export const menuLabel = 'flex h-7 items-center px-2 text-caption text-muted-foreground'

/** 1px divider with 4px above and below (9px total, as in Figma). */
export const menuSeparator = 'my-1 h-px bg-border'

/** Trailing shortcut hint: Caption, muted. */
export const menuShortcut = 'ml-auto pl-4 text-caption text-muted-foreground'
