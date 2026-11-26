import { type ReactNode } from 'react'
import { Button, StatusGlyph } from '@/components/atoms'
import { Breadcrumb, ConditionBadge, EmptyState, PropertyRow } from '@/components/molecules'
import { PageHeader } from '@/components/organisms'
import { ProfileTemplate } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import { shortAgo, type InventoryItem } from '@/mocks'
import { formatTicketId, TICKET_STATUS_LABEL, type Customer, type Ticket } from '@/types'

/**
 * Figma Interface · I2 Inventory — Item details: breadcrumb header with Delete / Edit / New
 * ticket, a summary strip, the tickets about this device, its history, and who has it.
 */

const longDate = (d: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${d}T00:00:00Z`))
const monthYear = (d: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${d}T00:00:00Z`),
  )

export interface ItemDetailPageProps {
  sidebar: ReactNode
  item: InventoryItem
  customer?: Customer & { company?: string }
  tickets: Ticket[]
  onBack: () => void
  onEdit: () => void
  onDelete: () => void
  onNewTicket: () => void
  onOpenTicket: (id: number) => void
  onOpenCustomer?: () => void
  /** Overlays (edit sheet, delete confirmation). */
  children?: ReactNode
}

export function ItemDetailPage({
  sidebar,
  item,
  customer,
  tickets,
  onBack,
  onEdit,
  onDelete,
  onNewTicket,
  onOpenTicket,
  onOpenCustomer,
  children,
}: ItemDetailPageProps) {
  useHotkeys({ escape: onBack, e: onEdit })
  const summary: [string, ReactNode][] = [
    ['Brand', item.brand],
    ['Category', item.category],
    ['Condition', <ConditionBadge key="c" condition={item.condition} />],
    ['Location', item.location],
    ['Warranty until', monthYear(item.warrantyUntil)],
  ]
  return (
    <ProfileTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <Breadcrumb
                items={[
                  { label: 'Items', href: '#', onClick: (e) => (e.preventDefault(), onBack()) },
                  { label: item.name },
                ]}
              />
              <span className="text-small text-muted-foreground tabular-nums">{item.serial}</span>
            </span>
          }
          actions={
            <>
              <Button variant="ghost" className="text-destructive" onClick={onDelete}>
                Delete
              </Button>
              <Button variant="secondary" shortcut="E" onClick={onEdit}>
                Edit
              </Button>
              <Button leadingIcon="plus" onClick={onNewTicket}>
                New ticket
              </Button>
            </>
          }
        />
      }
      intro={
        <dl className="grid grid-cols-5 overflow-hidden rounded-xl border bg-card">
          {summary.map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1 border-r px-4 py-3 last:border-r-0">
              <dt className="text-small text-muted-foreground">{label}</dt>
              <dd className="truncate text-body text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      }
      aside={
        <section
          aria-label="Customer"
          className="flex flex-col gap-1 rounded-xl border bg-card px-4 pt-3 pb-3"
        >
          <h2 className="pb-1 text-title text-foreground">
            {customer ? 'Customer' : 'Assigned to'}
          </h2>
          {customer ? (
            <>
              <PropertyRow label="Name">
                {onOpenCustomer ? (
                  <button
                    type="button"
                    onClick={onOpenCustomer}
                    className="cursor-pointer truncate rounded-xs text-left outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {customer.name}
                  </button>
                ) : (
                  customer.name
                )}
              </PropertyRow>
              <PropertyRow label="Phone">{customer.phone}</PropertyRow>
              <PropertyRow label="Company">{customer.company || undefined}</PropertyRow>
            </>
          ) : (
            <PropertyRow label="Name">{item.assignedTo}</PropertyRow>
          )}
          <PropertyRow label="Purchased">{longDate(item.purchased)}</PropertyRow>
          <PropertyRow label="Model">{item.model}</PropertyRow>
          <PropertyRow label="Serial">{item.serial}</PropertyRow>
        </section>
      }
    >
      <div className="flex flex-col gap-5 p-5">
        <section aria-label="Tickets" className="flex flex-col gap-2">
          <h2 className="text-title text-foreground">Tickets</h2>
          {tickets.length ? (
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-left text-body">
                <thead className="border-b bg-muted/40 text-small text-muted-foreground">
                  <tr>
                    <th className="h-9 w-24 ps-4 font-normal">ID</th>
                    <th className="font-normal">Subject</th>
                    <th className="w-40 font-normal">Status</th>
                    <th className="w-24 pe-4 font-normal">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr
                      key={t.id}
                      tabIndex={0}
                      onClick={() => onOpenTicket(t.id)}
                      onKeyDown={(e) => e.key === 'Enter' && onOpenTicket(t.id)}
                      className="cursor-pointer border-b outline-none last:border-b-0 hover:bg-accent focus-visible:bg-accent"
                    >
                      <td className="h-10 ps-4 tabular-nums">{formatTicketId(t.id)}</td>
                      <td className="truncate">{t.subject}</td>
                      <td>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <StatusGlyph status={t.status} label={null} />
                          {TICKET_STATUS_LABEL[t.status]}
                        </span>
                      </td>
                      <td className="pe-4 text-muted-foreground">{shortAgo(t.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="No tickets about this device"
              description="Tickets from its customer show up here."
            />
          )}
        </section>
        <section aria-label="History" className="flex flex-col gap-2">
          <h2 className="text-title text-foreground">History</h2>
          <ol className="flex flex-col gap-1.5 text-small text-muted-foreground">
            {item.history.map((h, i) => (
              <li key={i}>
                {h.when} · {h.text}
              </li>
            ))}
          </ol>
        </section>
      </div>
      {children}
    </ProfileTemplate>
  )
}
