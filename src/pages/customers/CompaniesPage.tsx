import { useMemo, useState, type ReactNode } from 'react'
import { Avatar, Badge, Button } from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  toast,
} from '@/components/molecules'
import {
  CompanyDialog,
  createDataTableColumns,
  DataTable,
  PageHeader,
  type CompanyFormValues,
} from '@/components/organisms'
import { ListPageTemplate } from '@/components/templates'
import type { CompanyRecord } from '@/mocks'

/**
 * Figma Interface · X15 Customers — Companies: every company with its domain, people, open
 * tickets, applications and last contact. Filter narrows it; a row opens the company's customers.
 */

export interface CompanyRow extends CompanyRecord {
  openTickets: number
}

const col = createDataTableColumns<CompanyRow>()
const columns = col.columns([
  col.accessor('name', {
    header: 'Company',
    cell: ({ getValue }) => (
      <span className="flex min-w-0 items-center gap-2">
        <Avatar name={getValue()} size="xs" aria-hidden />
        <span className="truncate">{getValue()}</span>
      </span>
    ),
  }),
  col.accessor('domain', {
    header: 'Domain',
    meta: { width: 170 },
    cell: ({ getValue }) => <span className="text-muted-foreground">{getValue() || '—'}</span>,
  }),
  col.accessor('people', {
    header: 'People',
    meta: { width: 90 },
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
  col.accessor('openTickets', {
    header: 'Open tickets',
    meta: { width: 120 },
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
  col.accessor((r) => r.applications.join(', '), {
    id: 'applications',
    header: 'Applications',
    meta: { width: 220 },
    cell: ({ row }) =>
      row.original.applications.length ? (
        <span className="flex gap-1">
          {row.original.applications.map((a) => (
            <Badge key={a} variant="outline">
              {a}
            </Badge>
          ))}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  }),
  col.accessor('lastContact', {
    header: 'Last contact',
    meta: { width: 110 },
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
])

export interface CompaniesPageProps {
  sidebar: ReactNode
  companies: CompanyRow[]
  applications: string[]
  onOpenCompany: (name: string) => void
  onAddCompany: (c: CompanyFormValues) => void
}

export function CompaniesPage({
  sidebar,
  companies,
  applications,
  onOpenCompany,
  onAddCompany,
}: CompaniesPageProps) {
  const [openOnly, setOpenOnly] = useState(false)
  const [apps, setApps] = useState<string[]>([])
  const [adding, setAdding] = useState(false)
  const active = (openOnly ? 1 : 0) + apps.length

  const shown = useMemo(
    () =>
      companies.filter(
        (c) =>
          (!openOnly || c.openTickets > 0) &&
          (apps.length === 0 || apps.some((a) => c.applications.includes(a))),
      ),
    [companies, openOnly, apps],
  )

  return (
    <ListPageTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          icon="inventory"
          title="Companies"
          count={companies.length}
          actions={
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" leadingIcon="filter">
                    {active ? `Filter · ${active}` : 'Filter'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuCheckboxItem
                    checked={openOnly}
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={(on) => setOpenOnly(on === true)}
                  >
                    Has open tickets
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Uses</DropdownMenuLabel>
                  {applications.map((a) => (
                    <DropdownMenuCheckboxItem
                      key={a}
                      checked={apps.includes(a)}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(on) =>
                        setApps((list) => (on ? [...list, a] : list.filter((x) => x !== a)))
                      }
                    >
                      {a}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button leadingIcon="plus" onClick={() => setAdding(true)}>
                Add company
              </Button>
            </>
          }
        />
      }
    >
      {shown.length ? (
        <DataTable
          appearance="flush"
          label="Companies"
          itemLabel="companies"
          columns={columns}
          data={shown}
          getRowId={(c) => c.name}
          pageSize={false}
          onRowClick={(c) => onOpenCompany(c.name)}
        />
      ) : (
        <div className="flex h-80 items-center justify-center p-6">
          <EmptyState
            type="no-results"
            title="No companies match"
            description="Change or clear the filter."
            action={
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setOpenOnly(false)
                  setApps([])
                }}
              >
                Clear filter
              </Button>
            }
          />
        </div>
      )}
      <CompanyDialog
        key={adding ? 'open' : 'closed'}
        open={adding}
        onOpenChange={setAdding}
        applications={applications}
        takenNames={companies.map((c) => c.name)}
        onSave={(c) => {
          onAddCompany(c)
          toast.success(`${c.name} added`)
        }}
      />
    </ListPageTemplate>
  )
}
