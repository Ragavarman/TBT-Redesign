import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useNavigate, useParams } from 'react-router'
import type { IconName } from '@/components/atoms'
import { ThemeProvider } from '@/lib/theme'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { TicketDetailPage } from '@/pages/tickets/TicketDetailPage'
import { TicketsTablePage } from '@/pages/tickets/TicketsTablePage'
import { AppSidebar } from './AppSidebar'
import {
  defaultView,
  findNavItem,
  parseTicketId,
  ticketPath,
  ticketsForView,
  viewPath,
} from './nav'

function TicketsTableRoute() {
  const navigate = useNavigate()
  return (
    <TicketsTablePage
      sidebar={<AppSidebar />}
      onOpenTicket={(id) => navigate(ticketPath('all', id))}
    />
  )
}

/** Screens built so far, keyed by "module/view". Every other menu item gets a placeholder. */
const PAGES: Record<string, () => ReactNode> = {
  'inbox/all': () => <TicketsTableRoute />,
}

function ViewRoute() {
  const { module = 'inbox', view } = useParams()
  if (!view) {
    const first = defaultView(module)
    return <Navigate to={first ? viewPath(module, first) : '/'} replace />
  }
  const page = PAGES[`${module}/${view}`]
  if (page) return page()
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
  const id = parseTicketId(ticketId)
  const tickets = ticketsForView(view)
  const ticket = tickets.find((t) => t.id === id)
  if (!ticket) return <Navigate to={viewPath('inbox', view)} replace />
  const item = findNavItem('inbox', view)
  return (
    <TicketDetailPage
      // remount per ticket so tab, status and filters start fresh
      key={ticket.id}
      sidebar={<AppSidebar initialCollapsed />}
      viewLabel={item?.label ?? 'Tickets'}
      viewCount={item?.count}
      tickets={tickets}
      ticket={ticket}
      onBack={() => navigate(viewPath('inbox', view))}
      onOpenTicket={(next) => navigate(ticketPath(view, next))}
    />
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/inbox/all" replace /> },
  { path: '/inbox/:view/:ticketId', element: <TicketRoute /> },
  { path: '/:module/:view?', element: <ViewRoute /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
