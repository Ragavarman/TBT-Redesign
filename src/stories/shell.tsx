/**
 * Story-only helpers for templates and pages: a working app sidebar fed by mock navigation,
 * and a labelled placeholder that marks a template slot. Not part of the library.
 */
import { useState, type ReactNode } from 'react'
import { IconButton } from '@/components/atoms'
import { Sidebar } from '@/components/organisms'
import { moduleNav, railFooterModules, railModules, wsCurrentAgent } from '@/mocks'
import { cn } from '@/lib/utils'

export function MockSidebar({
  module: initialModule = 'inbox',
  active: initialActive,
  collapsed,
}: {
  module?: string
  active?: string
  collapsed?: boolean
}) {
  const [module, setModule] = useState(initialModule)
  const nav = moduleNav[module] ?? moduleNav.inbox!
  const [active, setActive] = useState(initialActive ?? nav.sections[0]?.items[0]?.id ?? '')
  return (
    <Sidebar
      defaultCollapsed={collapsed}
      rail={{
        modules: railModules,
        footerModules: railFooterModules,
        activeId: module,
        onSelect: (m) => {
          const next = moduleNav[m.id]
          if (!next) return
          setModule(m.id)
          setActive(next.sections[0]?.items[0]?.id ?? '')
        },
        user: { name: wsCurrentAgent.name, presence: wsCurrentAgent.presence },
      }}
      nav={{
        title: nav.title,
        actions:
          module === 'inbox' ? (
            <>
              <IconButton icon="search" label="Search" size="sm" />
              <IconButton icon="plus" label="New ticket" size="sm" />
            </>
          ) : undefined,
        sections: nav.sections,
        activeId: active,
        onSelect: (item) => setActive(item.id),
      }}
    />
  )
}

/** Dashed box naming a template slot and its Figma size. */
export function SlotBox({
  name,
  hint,
  className,
}: {
  name: string
  hint?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-10 flex-col items-center justify-center gap-0.5 rounded-md border border-dashed border-primary/40 bg-primary/5 p-3 text-center',
        className,
      )}
    >
      <span className="text-label text-primary">{name}</span>
      {hint && <span className="text-caption text-muted-foreground">{hint}</span>}
    </div>
  )
}
