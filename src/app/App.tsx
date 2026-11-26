import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router'
import type { IconName } from '@/components/atoms'
import { Toaster } from '@/components/molecules'
import { ThemeProvider } from '@/lib/theme'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { TicketDetailPage } from '@/pages/tickets/TicketDetailPage'
import { TicketsListPage } from '@/pages/tickets/TicketsListPage'
import { TicketsTablePage } from '@/pages/tickets/TicketsTablePage'
import type { SavedView } from '@/pages/tickets/ticket-view'
import { AppSidebar } from './AppSidebar'
import { CustomerRoute, CustomersViewRoute } from './CustomerRoutes'
import { CollectionsProvider } from './CollectionsProvider'
import { CustomersRoot } from './CustomersRoot'
import { InventoryViewRoute, ItemRoute } from './InventoryRoutes'
import { KnowledgeViewRoute, NoteRoute } from './KnowledgeRoutes'
import { ReportsViewRoute } from './ReportRoutes'
import { SettingsViewRoute } from './SettingsRoutes'
import {
  BillingRoute,
  CustomerLocationsRoute,
  ForgotRoute,
  InboxDemoState,
  NotFoundRoute,
  SearchRoute,
  SignInRoute,
  WelcomeRoute,
} from './SharedRoutes'
import { TeamDetailRoute, TeamViewRoute } from './TeamRoutes'
import { useCannedReplies } from './stores'
import {
  defaultView,
  findNavItem,
  isCustomerListView,
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
  const { tickets, newTicket, updateTickets } = useWorkspace()
  const saveView = useSaveView()
  const [params] = useSearchParams()
  const demo = ['loading', 'error'].includes(params.get('demo') ?? '') ? params.get('demo') : null
  if (!view) {
    const first = defaultView(module)
    return <Navigate to={first ? viewPath(module, first) : '/'} replace />
  }

  if (module === 'inbox') {
    const open = (id: number) => navigate(ticketPath(view, id))
    // All tickets is the table (Figma 02); every other inbox view is the grouped list (X3/X4)
    if (view === 'all' && demo) return <InboxDemoState demo={demo} title="All tickets" />
    if (view === 'all') {
      return (
        <TicketsTablePage
          sidebar={<AppSidebar />}
          tickets={tickets}
          onOpenTicket={open}
          onSaveView={saveView}
          onNewTicket={newTicket}
          onUpdateTickets={updateTickets}
        />
      )
    }
    const saved = views.find((v) => v.id === view)
    const item = findNavItem('inbox', view)
    if (demo && (saved || item))
      return <InboxDemoState demo={demo} title={saved?.name ?? item!.label} />
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
          caughtUpAction={
            view === 'my-tickets'
              ? {
                  label: `View unassigned (${ticketsForView('unassigned', [], tickets).length})`,
                  onClick: () => navigate(viewPath('inbox', 'unassigned')),
                }
              : undefined
          }
        />
      )
    }
    return <NotFoundRoute />
  }

  if (module === 'customers' && view === 'locations') return <CustomerLocationsRoute />
  if (module === 'settings' && view === 'billing') return <BillingRoute />
  if (module === 'customers' && isCustomerListView(view)) return <CustomersViewRoute view={view} />
  if (module === 'settings') {
    const page = <SettingsViewRoute view={view} />
    if (page) return page
  }
  if (module === 'team') {
    const page = <TeamViewRoute view={view} />
    if (page) return page
  }
  if (module === 'inventory') {
    const page = <InventoryViewRoute view={view} />
    if (page) return page
  }
  if (module === 'knowledge') {
    const page = <KnowledgeViewRoute view={view} />
    if (page) return page
  }
  if (module === 'reports') {
    const page = <ReportsViewRoute view={view} />
    if (page) return page
  }

  const item = findNavItem(module, view)
  if (!item) return <NotFoundRoute />
  return (
    <PlaceholderPage
      sidebar={<AppSidebar />}
      title={item.label}
      icon={typeof item.icon === 'string' ? (item.icon as IconName) : undefined}
      count={item.count}
    />
  )
}

/** /:module/:view/:id — record pages: a knowledge note, an inventory item, an agent, a team… */
function DetailRoute() {
  const { module, view, id = '' } = useParams()
  if (module === 'knowledge' && view === 'notes') return <NoteRoute id={id} />
  if (module === 'inventory' && view === 'items') return <ItemRoute id={id} />
  if (module === 'team' && (view === 'agents' || view === 'teams'))
    return <TeamDetailRoute view={view} id={id} />
  return <Navigate to={`/${module}/${view}`} replace />
}

/** /inbox/:view/T-222 — a ticket opened from a view; the list panel shows that view. */
function TicketRoute() {
  const { view = 'all', ticketId } = useParams()
  const navigate = useNavigate()
  const { views } = useSavedViews()
  const { tickets: all } = useWorkspace()
  const canned = useCannedReplies()
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
      onOpenCustomer={() => navigate(`/customers/all/${ticket.requester.id}`)}
      cannedReplies={canned.items.map((c) => ({
        id: c.id,
        shortcut: c.shortcut,
        title: c.name,
        body: c.message,
      }))}
    />
  )
}

const router = createBrowserRouter([
  { path: '/signin', element: <SignInRoute /> },
  { path: '/forgot', element: <ForgotRoute /> },
  {
    element: <CustomersRoot />,
    children: [
      {
        element: <WorkspaceRoot />,
        children: [
          { path: '/', element: <Navigate to="/inbox/all" replace /> },
          { path: '/inbox/:view/:ticketId', element: <TicketRoute /> },
          { path: '/customers/:view/:customerId', element: <CustomerRoute /> },
          { path: '/:module/:view/:id', element: <DetailRoute /> },
          { path: '/:module/:view?', element: <ViewRoute /> },
          { path: '/search', element: <SearchRoute /> },
          { path: '/welcome', element: <WelcomeRoute /> },
          { path: '*', element: <NotFoundRoute /> },
        ],
      },
    ],
  },
])

export function App() {
  return (
    <ThemeProvider>
      <SavedViewsProvider>
        <CollectionsProvider>
          <RouterProvider router={router} />
        </CollectionsProvider>
      </SavedViewsProvider>
      <Toaster />
    </ThemeProvider>
  )
}
