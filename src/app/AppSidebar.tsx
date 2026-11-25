import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { IconButton } from '@/components/atoms'
import { Sidebar } from '@/components/organisms'
import { moduleNav, railFooterModules, railModules, wsCurrentAgent } from '@/mocks'
import { defaultView, viewPath } from './nav'

const COLLAPSED_KEY = 'tbt-sidebar-collapsed'

function readCollapsed(): boolean {
  try {
    return sessionStorage.getItem(COLLAPSED_KEY) === '1'
  } catch {
    return false
  }
}

function writeCollapsed(v: boolean) {
  try {
    sessionStorage.setItem(COLLAPSED_KEY, v ? '1' : '0')
  } catch {
    /* storage unavailable — the sidebar just won't remember */
  }
}

/**
 * The app sidebar, driven by the URL: the rail picks the module (/:module), the sub-navigation
 * picks the view (/:module/:view). Collapsed state survives page changes for the session.
 */
export function AppSidebar({
  initialCollapsed,
}: {
  /** Start collapsed/expanded on this screen regardless of the remembered state (not saved). */
  initialCollapsed?: boolean
}) {
  const { module = 'inbox', view } = useParams()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(initialCollapsed ?? readCollapsed)
  const nav = moduleNav[module] ?? moduleNav.inbox!

  return (
    <Sidebar
      collapsed={collapsed}
      onCollapsedChange={(v) => {
        setCollapsed(v)
        if (initialCollapsed === undefined) writeCollapsed(v)
      }}
      rail={{
        modules: railModules,
        footerModules: railFooterModules,
        activeId: module,
        onSelect: (m) => {
          const first = defaultView(m.id)
          if (first) navigate(viewPath(m.id, first))
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
        activeId: view,
        onSelect: (item) => navigate(viewPath(module, item.id)),
      }}
    />
  )
}
