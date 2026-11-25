import { useState, type ComponentProps, type ReactNode } from 'react'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { AppRail, type AppRailProps } from '../app-rail'
import { SubNavigation } from '../sub-navigation'
import type { NavItem, NavSection } from '../sub-navigation/types'

export interface SidebarProps extends Omit<ComponentProps<'aside'>, 'onSelect'> {
  /** App rail (modules, footer modules, user, logo). */
  rail: Omit<AppRailProps, 'className'>
  /** The active module's menu. */
  nav: {
    title: ReactNode
    subtitle?: ReactNode
    actions?: ReactNode
    sections: NavSection[]
    activeId?: string
    onSelect?: (item: NavItem) => void
  }
  /** Controlled collapsed state. Omit for uncontrolled. */
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

/**
 * App sidebar (Figma 07 · Apprail-max): app rail + the active module's sub-navigation in one
 * rounded sidebar surface. The edge tab collapses it to the 56px rail.
 */
export function Sidebar({
  rail,
  nav,
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  className,
  ...props
}: SidebarProps) {
  const [collapsedState, setCollapsedState] = useState(defaultCollapsed)
  const collapsed = collapsedProp ?? collapsedState
  const setCollapsed = (v: boolean) => {
    if (collapsedProp === undefined) setCollapsedState(v)
    onCollapsedChange?.(v)
  }

  return (
    <aside
      data-slot="sidebar"
      data-collapsed={collapsed || undefined}
      className={cn(
        'relative flex h-full shrink-0 rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground',
        'transition-[width] duration-200 ease-out motion-reduce:transition-none',
        // rail 56 (+ sub-nav 240) + 2px of border
        collapsed ? 'w-[calc(3.5rem+2px)]' : 'w-[calc(18.5rem+2px)]',
        className,
      )}
      {...props}
    >
      <AppRail
        {...rail}
        className={cn(
          'rounded-l-xl',
          !collapsed && 'border-r border-sidebar-border',
          collapsed && 'rounded-r-xl',
        )}
      />
      <div
        className={cn('min-w-0 flex-1 overflow-hidden rounded-r-xl', collapsed && 'hidden')}
        inert={collapsed}
      >
        <SubNavigation {...nav} className="w-60" />
      </div>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        aria-expanded={!collapsed}
        className={cn(
          'absolute top-1/2 -right-2 z-10 flex h-8 w-4 -translate-y-1/2 items-center justify-center',
          'rounded-sm border border-sidebar-border bg-sidebar text-muted-foreground outline-none',
          'hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        )}
      >
        <Icon name={collapsed ? 'chevron-right' : 'chevron-left'} size={12} />
      </button>
    </aside>
  )
}
