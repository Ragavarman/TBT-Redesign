import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Avatar, Badge, Button, Input, type IconName } from '@/components/atoms'
import { EmptyState } from '@/components/molecules'
import { createDataTableColumns, DataTable, PageHeader } from '@/components/organisms'
import { ListPageTemplate } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import type { Customer, CustomerProfile } from '@/types'

/**
 * Customers list (the Customers module's views: All customers, Needs review, VIP, Frequent
 * callers). Search by name, phone, email or company; click a row for the profile.
 */

export interface CustomerRow {
  customer: Customer
  profile: CustomerProfile
  /** Open tickets in the workspace. */
  open: number
}

const longDate = (d: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${d}T00:00:00Z`))

const col = createDataTableColumns<CustomerRow>()
const columns = col.columns([
  col.accessor((r) => r.customer.name, {
    id: 'name',
    header: 'Customer',
    cell: ({ row }) => (
      <span className="flex min-w-0 items-center gap-2">
        <Avatar name={row.original.customer.name} size="xs" aria-hidden />
        <span className="truncate">{row.original.customer.name}</span>
      </span>
    ),
  }),
  col.accessor((r) => r.profile.company ?? '', {
    id: 'company',
    header: 'Company',
    meta: { width: 170 },
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() || '—'}</span>,
  }),
  col.accessor((r) => r.customer.phone ?? r.customer.email, {
    id: 'contact',
    header: 'Contact',
    meta: { width: 220 },
    cell: ({ getValue }) => <span className="truncate text-muted-foreground">{getValue()}</span>,
  }),
  col.accessor((r) => r.profile.tags.join(', '), {
    id: 'tags',
    header: 'Tags',
    meta: { width: 200 },
    cell: ({ row }) => (
      <span className="flex gap-1">
        {row.original.profile.tags.map((t) => (
          <Badge key={t} variant="outline">
            {t}
          </Badge>
        ))}
      </span>
    ),
  }),
  col.accessor('open', {
    header: 'Open',
    meta: { width: 80 },
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
  col.accessor((r) => r.profile.since, {
    id: 'since',
    header: 'Customer since',
    meta: { width: 140 },
    cell: ({ getValue }) => <span className="text-muted-foreground">{longDate(getValue())}</span>,
  }),
])

export interface CustomersListPageProps {
  sidebar: ReactNode
  title: string
  icon?: IconName
  rows: CustomerRow[]
  onOpenCustomer: (id: string) => void
  /** Figma C3, wired in its own step. */
  onNewCustomer?: () => void
}

export function CustomersListPage({
  sidebar,
  title,
  icon = 'customers',
  rows,
  onOpenCustomer,
  onNewCustomer,
}: CustomersListPageProps) {
  const [query, setQuery] = useState('')
  const search = useRef<HTMLInputElement>(null)
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [r.customer.name, r.customer.email, r.customer.phone, r.profile.company, ...r.profile.tags]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [rows, query])

  // "/" jumps to search
  useHotkeys({ '/': () => search.current?.focus() })

  return (
    <ListPageTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          icon={icon}
          title={title}
          count={rows.length}
          actions={
            <Button leadingIcon="plus" onClick={onNewCustomer} disabled={!onNewCustomer}>
              New customer
            </Button>
          }
        />
      }
      toolbar={
        <div className="px-4 py-2">
          <Input
            ref={search}
            type="search"
            leadingIcon="search"
            shortcut="/"
            aria-label="Search customers"
            placeholder="Search name, phone, email or company"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClear={query ? () => setQuery('') : undefined}
            wrapperClassName="max-w-96"
          />
        </div>
      }
    >
      {shown.length ? (
        <DataTable
          appearance="flush"
          label={title}
          itemLabel="customers"
          columns={columns}
          data={shown}
          getRowId={(r) => r.customer.id}
          pageSize={false}
          onRowClick={(r) => onOpenCustomer(r.customer.id)}
        />
      ) : (
        <div className="flex h-80 items-center justify-center p-6">
          <EmptyState
            type={query ? 'no-results' : 'empty'}
            title={query ? 'No customers match' : 'No customers here'}
            description={
              query
                ? 'Try a name, phone number or email.'
                : 'Customers in this view will show up here.'
            }
          />
        </div>
      )}
    </ListPageTemplate>
  )
}
