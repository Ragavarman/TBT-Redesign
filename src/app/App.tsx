import { createBrowserRouter, Navigate, RouterProvider, useNavigate, useParams } from 'react-router'
import type { IconName } from '@/components/atoms'
import { Toaster } from '@/components/molecules'
import { ThemeProvider } from '@/lib/theme'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { TicketDetailPage } from '@/pages/tickets/TicketDetailPage'
import { TicketsListPage } from '@/pages/tickets/TicketsListPage'
import { TicketsTablePage } from '@/pages/tickets/TicketsTablePage'
import type { SavedView } from '@/pages/tickets/ticket-view'
import { AppSidebar } from './AppSidebar'
import {
  defaultView,
  findNavItem,
  parseTicketId,
  ticketPath,
  ticketsForView,
  viewPath,
} from './nav'
import { useSavedViews } from './saved-views-context'
import { SavedViewsProvider } from './SavedViewsProvider'
import { useWorkspace } from './workspace-context'
import { WorkspaceRoot } from './WorkspaceRoot'

/** Save a view, then go to it — it now sits in the sidebar under Views. */
function useSaveView() {
  const navigate = useNavigate()
  const { add } = useSavedViews()
  return (view: SavedView) => {
    add(view)
    navigate(viewPath('inbox', view.id))
  }
}

function ViewRoute() {
  const { module = 'inbox', view } = useParams()
  const navigate = useNavigate()
  const { views } = useSavedViews()
  const { tickets, newTicket } = useWorkspace()
  const saveView = useSaveView()
  if (!view) {
    const first = defaultView(module)
    return <Navigate to={first ? viewPath(module, first) : '/'} replace />
  }

  if (module === 'inbox') {
    const open = (id: number) => navigate(ticketPath(view, id))
    // All tickets is the table (Figma 02); every other inbox view is the grouped list (X3/X4)
    if (view === 'all') {
      return (
        <TicketsTablePage
          sidebar={<AppSidebar />}
          tickets={tickets}
          onOpenTicket={open}
          onSaveView={saveView}
          onNewTicket={newTicket}
        />
      )
    }
    const saved = views.find((v) => v.id === view)
    const item = findNavItem('inbox', view)
    if (saved || item) {
      return (
        <TicketsListPage
          key={view}
          sidebar={<AppSidebar />}
          title={saved?.name ?? item!.label}
          icon={
            saved ? 'reports' : typeof item?.icon === 'string' ? (item.icon as IconName) : 'inbox'
          }
          tickets={ticketsForView(saved ? 'all' : view, [], tickets)}
          initialFilters={saved?.filters}
          initialDisplay={saved?.display}
          onOpenTicket={open}
          onSaveView={saveView}
          onNewTicket={newTicket}
        />
      )
    }
    return <Navigate to="/" replace />
  }

  const item = findNavItem(module, view)
  if (!item) return <Navigate to="/" replace />
  return (
    <PlaceholderPage
      sidebar={<AppSidebar />}
      title={item.label}
      icon={typeof item.icon === 'string' ? (item.icon as IconName) : undefined}
      count={item.count}
    />
  )
}

/** /inbox/:view/T-222 — a ticket opened from a view; the list panel shows that view. */
function TicketRoute() {
  const { view = 'all', ticketId } = useParams()
  const navigate = useNavigate()
  const { views } = useSavedViews()
  const { tickets: all } = useWorkspace()
  const id = parseTicketId(ticketId)
  const tickets = ticketsForView(view, views, all)
  const ticket = tickets.find((t) => t.id === id)
  if (!ticket) return <Navigate to={viewPath('inbox', view)} replace />
  const saved = views.find((v) => v.id === view)
  const item = findNavItem('inbox', view)
  return (
    <TicketDetailPage
      // remount per ticket so tab, status and filters start fresh
      key={ticket.id}
      sidebar={<AppSidebar initialCollapsed />}
      viewLabel={saved?.name ?? item?.label ?? 'Tickets'}
      viewCount={saved ? tickets.length : item?.count}
      tickets={tickets}
      ticket={ticket}
      onBack={() => navigate(viewPath('inbox', view))}
      onOpenTicket={(next) => navigate(ticketPath(view, next))}
    />
  )
}

const router = createBrowserRouter([
  {
    element: <WorkspaceRoot />,
    children: [
      { path: '/', element: <Navigate to="/inbox/all" replace /> },
      { path: '/inbox/:view/:ticketId', element: <TicketRoute /> },
      { path: '/:module/:view?', element: <ViewRoute /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export function App() {
  return (
    <ThemeProvider>
      <SavedViewsProvider>
        <RouterProvider router={router} />
      </SavedViewsProvider>
      <Toaster />
    </ThemeProvider>
  )
}
