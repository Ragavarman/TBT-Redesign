import { Fragment, useState, type ComponentProps, type ReactNode } from 'react'
import { Icon } from '@/components/atoms'
import { SidebarGroupLabel, SidebarItem } from '@/components/molecules'
import { cn } from '@/lib/utils'
import { WorkspaceHeader } from '../workspace-header'
import type { NavItem, NavSection } from './types'

export interface SubNavigationProps extends Omit<ComponentProps<'nav'>, 'title' | 'onSelect'> {
  /** Header title — workspace or module name. */
  title: ReactNode
  subtitle?: ReactNode
  /** Header icon buttons (search, new …). */
  actions?: ReactNode
  sections: NavSection[]
  /** Id of the current item (gets aria-current + active fill). */
  activeId?: string
  /** Called when a row without `href` is chosen. */
  onSelect?: (item: NavItem) => void
}

/**
 * A module's menu (Figma 07 · Sub navigation / Tickets, Reports, …): workspace header,
 * then sections of SidebarItems with group labels and nested saved views. Data-driven.
 */
export function SubNavigation({
  title,
  subtitle,
  actions,
  sections,
  activeId,
  onSelect,
  className,
  ...props
}: SubNavigationProps) {
  const [closed, setClosed] = useState<Record<string, boolean>>({})

  const row = (item: NavItem, level: 0 | 1) => {
    const trailing = item.chevron ? (
      <Icon name="chevron-right" size={14} className="text-muted-foreground" />
    ) : (
      item.count
    )
    const common = {
      icon: item.icon,
      level,
      count: trailing,
      unread: item.unread,
      active: item.id === activeId,
      disabled: item.disabled,
    }
    return item.href ? (
      <SidebarItem key={item.id} label={item.label} {...common} asChild>
        <a href={item.href} onClick={() => onSelect?.(item)}>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
        </a>
      </SidebarItem>
    ) : (
      <SidebarItem key={item.id} label={item.label} {...common} onClick={() => onSelect?.(item)} />
    )
  }

  return (
    <nav
      data-slot="sub-navigation"
      aria-label={typeof title === 'string' ? title : undefined}
      className={cn('flex h-full min-h-0 flex-col bg-sidebar', className)}
      {...props}
    >
      <WorkspaceHeader title={title} subtitle={subtitle} actions={actions} />
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2 py-2.5">
        {sections.map((section, i) => {
          const open = !closed[section.id]
          return (
            <Fragment key={section.id}>
              {section.label && (
                <SidebarGroupLabel
                  label={section.label}
                  className={cn(i > 0 && 'mt-2')}
                  collapsible={section.collapsible}
                  open={open}
                  onOpenChange={(v) => setClosed((c) => ({ ...c, [section.id]: !v }))}
                  action={section.action}
                />
              )}
              {open &&
                section.items.map((item) => (
                  <Fragment key={item.id}>
                    {row(item, 0)}
                    {item.children?.map((child) => row(child, 1))}
                  </Fragment>
                ))}
            </Fragment>
          )
        })}
      </div>
    </nav>
  )
}
