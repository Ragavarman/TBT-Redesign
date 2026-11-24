import type { ComponentProps, ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Tabs as UiTabs,
  TabsContent,
  TabsList as UiTabsList,
  TabsTrigger as UiTabsTrigger,
} from '@/components/ui/tabs'
import { Icon, type IconName } from '@/components/atoms'

/** Tabs root — manages the selected value. */
export function Tabs(props: ComponentProps<typeof UiTabs>) {
  return <UiTabs {...props} />
}

export interface TabsListProps extends Omit<ComponentProps<typeof UiTabsList>, 'variant'> {
  /** pill (default) — view switchers in toolbars · underline — page-level sections. */
  variant?: 'pill' | 'underline'
}

export function TabsList({ variant = 'pill', ...props }: TabsListProps) {
  return <UiTabsList variant={variant} {...props} />
}

export interface TabsTriggerProps extends ComponentProps<typeof UiTabsTrigger> {
  /** 14px icon before the label. */
  icon?: IconName | LucideIcon
  /** Count after the label (Small, muted), e.g. number of tickets in the view. */
  count?: ReactNode
}

/** One tab (Figma 07 · Tab): icon · label · count. */
export function TabsTrigger({ icon, count, children, ...props }: TabsTriggerProps) {
  return (
    <UiTabsTrigger {...props}>
      {icon !== undefined &&
        (typeof icon === 'string' ? (
          <Icon name={icon} size={14} />
        ) : (
          <Icon icon={icon} size={14} />
        ))}
      {children}
      {count !== undefined && <span className="text-small text-muted-foreground">{count}</span>}
    </UiTabsTrigger>
  )
}

export { TabsContent }
