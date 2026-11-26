import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem as UiCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem as UiItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger as UiSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Icon, type IconName } from '@/components/atoms'

type ItemIcon = IconName | LucideIcon

const renderIcon = (icon?: ItemIcon) =>
  icon === undefined ? null : typeof icon === 'string' ? (
    <Icon name={icon} size={14} />
  ) : (
    <Icon icon={icon} size={14} />
  )

export interface DropdownMenuItemProps extends Omit<ComponentProps<typeof UiItem>, 'variant'> {
  /** 14px icon before the label. */
  icon?: ItemIcon
  /** Shortcut hint at the end, e.g. "I" or "⌘K". */
  shortcut?: string
  /** Destructive action (Figma type=destructive). */
  destructive?: boolean
}

/** Menu row (Figma 07 · Menu item): icon · label · shortcut. */
export function DropdownMenuItem({
  icon,
  shortcut,
  destructive,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <UiItem variant={destructive ? 'destructive' : 'default'} {...props}>
      {renderIcon(icon)}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </UiItem>
  )
}

export interface DropdownMenuCheckboxItemProps extends ComponentProps<typeof UiCheckboxItem> {
  icon?: ItemIcon
  shortcut?: string
}

/** Toggle row (Figma type=checkbox): check slot · icon · label. */
export function DropdownMenuCheckboxItem({
  icon,
  shortcut,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <UiCheckboxItem {...props}>
      {renderIcon(icon)}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
    </UiCheckboxItem>
  )
}

/** Row that opens a submenu (Figma "Submenu" chevron). */
export function DropdownMenuSubTrigger({
  icon,
  children,
  ...props
}: ComponentProps<typeof UiSubTrigger> & { icon?: ItemIcon; children: ReactNode }) {
  return (
    <UiSubTrigger {...props}>
      {renderIcon(icon)}
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </UiSubTrigger>
  )
}

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
}
