import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { IconButton } from '@/components/atoms'
import { Sidebar } from '@/components/organisms'
import { moduleNav, railFooterModules, railModules, wsCurrentAgent } from '@/mocks'
import { defaultView, savedViewItems, viewPath } from './nav'
import { useSavedViews } from './saved-views-context'
import { useWorkspace } from './workspace-context'

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
  const { views } = useSavedViews()
  const { newTicket } = useWorkspace()

  // Saved views go under Views, and favourites under Favorites too.
  const sections =
    module !== 'inbox' || views.length === 0
      ? nav.sections
      : nav.sections.map((s) =>
          s.id === 'views'
            ? { ...s, items: [...s.items, ...savedViewItems(views)] }
            : s.id === 'favorites'
              ? { ...s, items: [...s.items, ...savedViewItems(views.filter((v) => v.favorite))] }
              : s,
        )

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
              <IconButton
                icon="plus"
                label="New ticket (C)"
                size="sm"
                onClick={() => newTicket()}
              />
            </>
          ) : undefined,
        sections,
        activeId: view,
        onSelect: (item) => navigate(viewPath(module, item.id)),
      }}
    />
  )
}
