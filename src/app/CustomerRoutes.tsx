import { Navigate, useNavigate, useParams } from 'react-router'
import type { IconName } from '@/components/atoms'
import { wsCustomerList, wsCustomerProfile } from '@/mocks'
import { CustomerProfilePage } from '@/pages/customers/CustomerProfilePage'
import { CustomersListPage, type CustomerRow } from '@/pages/customers/CustomersListPage'
import type { Ticket } from '@/types'
import { AppSidebar } from './AppSidebar'
import { findNavItem, isCustomerListView, ticketPath, viewPath } from './nav'
import { useWorkspace } from './workspace-context'

const isOpen = (t: Ticket) => t.status !== 'resolved' && t.status !== 'closed'

function rowsFor(view: string, tickets: Ticket[]): CustomerRow[] {
  const rows = wsCustomerList.map((customer) => ({
    customer,
    profile: wsCustomerProfile(customer.id)!,
    open: tickets.filter((t) => t.requester.id === customer.id && isOpen(t)).length,
  }))
  switch (view) {
    case 'review':
      return rows.filter((r) => r.profile.needsReview)
    case 'vip':
      return rows.filter((r) => r.profile.tags.includes('VIP'))
    case 'frequent':
      return rows.filter((r) => r.profile.tags.includes('Frequent caller'))
    default:
      return rows
  }
}

/** /customers/:view — the list, when the view is one of the customer lists. */
export function CustomersViewRoute({ view }: { view: string }) {
  const navigate = useNavigate()
  const { tickets } = useWorkspace()
  if (!isCustomerListView(view)) return null
  const item = findNavItem('customers', view)
  return (
    <CustomersListPage
      key={view}
      sidebar={<AppSidebar />}
      title={item?.label ?? 'Customers'}
      icon={typeof item?.icon === 'string' ? (item.icon as IconName) : 'customers'}
      rows={rowsFor(view, tickets)}
      onOpenCustomer={(id) => navigate(`/customers/${view}/${id}`)}
    />
  )
}

/** /customers/:view/:customerId — the profile (Figma 05b, C1, C2, X14). */
export function CustomerRoute() {
  const { view = 'all', customerId = '' } = useParams()
  const navigate = useNavigate()
  const { tickets, newTicket } = useWorkspace()
  const customer = wsCustomerList.find((c) => c.id === customerId)
  const profile = customer && wsCustomerProfile(customer.id)
  if (!customer || !profile) return <Navigate to={viewPath('customers', view)} replace />
  return (
    <CustomerProfilePage
      key={customer.id}
      sidebar={<AppSidebar />}
      customer={customer}
      profile={profile}
      tickets={tickets.filter((t) => t.requester.id === customer.id)}
      onBack={() => navigate(viewPath('customers', view))}
      onOpenTicket={(id) => navigate(ticketPath('all', id))}
      onNewTicket={() => newTicket(customer.id)}
    />
  )
}
