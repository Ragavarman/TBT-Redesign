import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import type { IconName } from '@/components/atoms'
import { toast } from '@/components/molecules'
import { CustomerProfilePage } from '@/pages/customers/CustomerProfilePage'
import { CompaniesPage } from '@/pages/customers/CompaniesPage'
import { CustomersListPage, type CustomerRow } from '@/pages/customers/CustomersListPage'
import { DuplicatesPage } from '@/pages/customers/DuplicatesPage'
import { TagsPage } from '@/pages/customers/TagsPage'
import type { Ticket } from '@/types'
import { AppSidebar } from './AppSidebar'
import { useCustomers, type CustomerRecord } from './customers-context'
import { findNavItem, isCustomerListView, ticketPath, viewPath } from './nav'
import { useWorkspace } from './workspace-context'

const isOpen = (t: Ticket) => t.status !== 'resolved' && t.status !== 'closed'

function rowsFor(view: string, records: CustomerRecord[], tickets: Ticket[]): CustomerRow[] {
  const rows = records.map(({ customer, profile }) => ({
    customer,
    profile,
    open: tickets.filter((t) => t.requester.id === customer.id && isOpen(t)).length,
  }))
  switch (view) {
    case 'vip':
      return rows.filter((r) => r.profile.tags.includes('VIP'))
    case 'frequent':
      return rows.filter((r) => r.profile.tags.includes('Frequent caller'))
    default:
      return rows
  }
}

/** /customers/:view — All customers / VIP / Frequent callers lists, Needs review, Tags. */
export function CustomersViewRoute({ view }: { view: string }) {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { tickets } = useWorkspace()
  const c = useCustomers()
  if (!isCustomerListView(view)) return null

  if (view === 'review') {
    return (
      <DuplicatesPage
        sidebar={<AppSidebar />}
        initialId={params.get('group') ?? undefined}
        groups={c.duplicates.flatMap((g) => {
          const a = c.records.find((r) => r.customer.id === g.customerId)
          if (!a) return []
          const count = tickets.filter((t) => t.requester.id === a.customer.id).length
          return [{ id: g.id, a: { ...a, tickets: count }, b: g.other }]
        })}
        onMerge={(id, picks) => {
          const g = c.duplicates.find((d) => d.id === id)
          c.mergeDuplicate(id, picks)
          toast.success(`Merged into one customer${g ? ` · ${g.other.externalId} kept` : ''}`)
        }}
        onDismiss={(id) => {
          c.dismissDuplicate(id)
          toast.success('Marked as not a duplicate')
        }}
        onOpenCustomer={(id) => navigate(`/customers/all/${id}`)}
      />
    )
  }

  if (view === 'tags') {
    const usage: Record<string, number> = {}
    for (const r of c.records) for (const t of r.profile.tags) usage[t] = (usage[t] ?? 0) + 1
    return (
      <TagsPage
        sidebar={<AppSidebar />}
        tags={c.tags}
        usage={usage}
        onSave={c.saveTag}
        onDelete={c.deleteTag}
      />
    )
  }

  if (view === 'companies') {
    const companyOf = new Map(c.records.map((r) => [r.customer.id, r.profile.company]))
    return (
      <CompaniesPage
        sidebar={<AppSidebar />}
        companies={c.companies.map((co) => ({
          ...co,
          openTickets: tickets.filter((t) => isOpen(t) && companyOf.get(t.requester.id) === co.name)
            .length,
        }))}
        applications={['Customer Portal', 'POS', 'Inventory', 'Payments']}
        onOpenCompany={(name) => navigate(`/customers/all?q=${encodeURIComponent(name)}`)}
        onAddCompany={(v) => c.addCompany({ ...v, people: 0, lastContact: '—' })}
      />
    )
  }

  const item = findNavItem('customers', view)
  return (
    <CustomersListPage
      key={`${view}-${params.get('q') ?? ''}`}
      sidebar={<AppSidebar />}
      initialQuery={params.get('q') ?? ''}
      title={item?.label ?? 'Customers'}
      icon={typeof item?.icon === 'string' ? (item.icon as IconName) : 'customers'}
      rows={rowsFor(view, c.records, tickets)}
      onOpenCustomer={(id) => navigate(`/customers/${view}/${id}`)}
      onNewCustomer={() => c.editCustomer()}
      duplicates={
        view === 'all'
          ? {
              count: c.duplicates.length,
              onReview: () => navigate(viewPath('customers', 'review')),
            }
          : undefined
      }
    />
  )
}

/** /customers/:view/:customerId — the profile (Figma 05b, C1, C2, X14). */
export function CustomerRoute() {
  const { view = 'all', customerId = '' } = useParams()
  const navigate = useNavigate()
  const { tickets, newTicket } = useWorkspace()
  const c = useCustomers()
  const record = c.records.find((r) => r.customer.id === customerId)
  if (!record) return <Navigate to={viewPath('customers', view)} replace />
  const duplicate = c.duplicates.find((d) => d.customerId === record.customer.id)
  return (
    <CustomerProfilePage
      key={record.customer.id}
      sidebar={<AppSidebar />}
      customer={record.customer}
      profile={record.profile}
      tickets={tickets.filter((t) => t.requester.id === record.customer.id)}
      onBack={() => navigate(viewPath('customers', view === 'review' ? 'all' : view))}
      onOpenTicket={(id) => navigate(ticketPath('all', id))}
      onNewTicket={() => newTicket(record.customer.id)}
      onEdit={() => c.editCustomer(record.customer.id)}
      onMerge={() =>
        duplicate
          ? navigate(`${viewPath('customers', 'review')}?group=${duplicate.id}`)
          : toast.info(`No possible duplicates for ${record.customer.name}`)
      }
    />
  )
}
