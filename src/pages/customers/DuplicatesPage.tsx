import { useState, type ReactNode } from 'react'
import { Avatar, Button, Icon } from '@/components/atoms'
import { EmptyState } from '@/components/molecules'
import { PageHeader } from '@/components/organisms'
import { ListPageTemplate } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import { cn } from '@/lib/utils'
import type { Customer, CustomerProfile } from '@/types'

/**
 * Figma Interface · C4 Review & merge duplicates: possible duplicates on the left (matched by
 * phone), a field-by-field comparison on the right — pick which value to keep, then Merge or
 * mark Not a duplicate.
 */

export type MergeField = 'name' | 'phone' | 'email' | 'company' | 'tags'
export type FieldPicks = Record<MergeField, 'a' | 'b'>

export interface DuplicateView {
  id: string
  a: { customer: Customer; profile: CustomerProfile; tickets: number }
  b: {
    name: string
    phone?: string
    email?: string
    company?: string
    tags: string[]
    tickets: number
    created: string
    externalId: string
  }
}

export interface DuplicatesPageProps {
  sidebar: ReactNode
  groups: DuplicateView[]
  initialId?: string
  onMerge: (id: string, picks: FieldPicks) => void
  onDismiss: (id: string) => void
  onOpenCustomer: (id: string) => void
}

const longDate = (d: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${d.slice(0, 10)}T00:00:00Z`))

/** Prefer whichever side has a value; ties go to the TBT record. */
function defaultPicks(g: DuplicateView): FieldPicks {
  const prefer = (a?: string, b?: string): 'a' | 'b' => (!a && b ? 'b' : 'a')
  return {
    name: g.b.name.length > g.a.customer.name.length ? 'b' : 'a',
    phone: prefer(g.a.customer.phone, g.b.phone),
    email: prefer(g.a.customer.email, g.b.email),
    company: prefer(g.a.profile.company, g.b.company),
    tags: g.a.profile.tags.length ? 'a' : 'b',
  }
}

export function DuplicatesPage({
  sidebar,
  groups,
  initialId,
  onMerge,
  onDismiss,
  onOpenCustomer,
}: DuplicatesPageProps) {
  const [selectedId, setSelectedId] = useState(initialId ?? groups[0]?.id)
  const selected = groups.find((g) => g.id === selectedId) ?? groups[0]
  const [picksById, setPicksById] = useState<Record<string, FieldPicks>>({})
  const picks = selected ? (picksById[selected.id] ?? defaultPicks(selected)) : undefined
  const setPick = (field: MergeField, side: 'a' | 'b') =>
    selected && setPicksById((p) => ({ ...p, [selected.id]: { ...picks!, [field]: side } }))

  const index = selected ? groups.indexOf(selected) : -1
  const step = (by: number) => {
    const next = groups[index + by]
    if (next) setSelectedId(next.id)
  }
  // after merging or dismissing, move to the next group
  const done = (fn: () => void) => {
    const next = groups[index + 1] ?? groups[index - 1]
    fn()
    setSelectedId(next?.id)
  }
  useHotkeys({ j: () => step(1), k: () => step(-1) })

  const rows: { field: MergeField | 'tickets' | 'created'; label: string; a: string; b: string }[] =
    selected
      ? [
          { field: 'name', label: 'Name', a: selected.a.customer.name, b: selected.b.name },
          {
            field: 'phone',
            label: 'Phone',
            a: selected.a.customer.phone ?? '',
            b: selected.b.phone ?? '',
          },
          {
            field: 'email',
            label: 'Email',
            a: selected.a.customer.email,
            b: selected.b.email ?? '',
          },
          {
            field: 'company',
            label: 'Company',
            a: selected.a.profile.company ?? '',
            b: selected.b.company ?? '',
          },
          {
            field: 'tags',
            label: 'Tags',
            a: selected.a.profile.tags.join(', '),
            b: selected.b.tags.join(', '),
          },
          {
            field: 'tickets',
            label: 'Tickets',
            a: `${selected.a.tickets} ${selected.a.tickets === 1 ? 'ticket' : 'tickets'}`,
            b: `${selected.b.tickets} ${selected.b.tickets === 1 ? 'ticket' : 'tickets'}`,
          },
          {
            field: 'created',
            label: 'Created',
            a: longDate(selected.a.profile.since),
            b: longDate(selected.b.created),
          },
        ]
      : []

  return (
    <ListPageTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          icon="bell"
          title="Needs review"
          count={`${groups.length} possible ${groups.length === 1 ? 'duplicate' : 'duplicates'}`}
          actions={
            selected && (
              <>
                <Button variant="secondary" onClick={() => done(() => onDismiss(selected.id))}>
                  Not a duplicate
                </Button>
                <Button onClick={() => done(() => onMerge(selected.id, picks!))}>Merge</Button>
              </>
            )
          }
        />
      }
    >
      {!selected ? (
        <div className="flex h-full items-center justify-center p-6">
          <EmptyState
            icon="check"
            title="No duplicates to review"
            description="Imported records that look alike show up here."
          />
        </div>
      ) : (
        <div className="flex h-full min-h-0">
          <nav
            aria-label="Possible duplicates"
            className="flex w-80 shrink-0 flex-col gap-1 overflow-y-auto border-r p-2"
          >
            <h2 className="px-2 pt-1 pb-1 text-caption text-muted-foreground">
              Matched by phone number
            </h2>
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-current={g.id === selected.id ? 'true' : undefined}
                onClick={() => setSelectedId(g.id)}
                className={cn(
                  'flex items-center gap-3 rounded-md px-2 py-2 text-left outline-none',
                  'transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                  g.id === selected.id && 'bg-muted',
                )}
              >
                <Avatar name={g.b.name} size="sm" aria-hidden />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body text-foreground">{g.b.name}</span>
                  <span className="truncate text-small text-muted-foreground">
                    {g.a.customer.phone ?? g.b.phone}
                  </span>
                </span>
                <span className="shrink-0 text-small text-muted-foreground">2 records</span>
              </button>
            ))}
          </nav>
          <section
            aria-label="Compare records"
            className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
          >
            <div className="flex flex-col gap-1">
              <h2 className="text-title text-foreground">Pick the value to keep for each field</h2>
              <p className="text-body text-muted-foreground">
                Tickets, notes and calls from both records move to the merged customer. This can’t
                be undone.
              </p>
            </div>
            <table className="w-full text-left text-body">
              <thead className="border-b text-small text-muted-foreground">
                <tr>
                  <th className="h-10 w-32 font-normal">Field</th>
                  <th className="font-normal">
                    Record A · TBT{' '}
                    <button
                      type="button"
                      onClick={() => onOpenCustomer(selected.a.customer.id)}
                      className="cursor-pointer rounded-xs text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      open
                    </button>
                  </th>
                  <th className="font-normal">Record B · {selected.b.externalId}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const choosable = r.field !== 'tickets' && r.field !== 'created'
                  const name = `${selected.id}-${r.field}`
                  return (
                    <tr key={r.field} className="border-b">
                      <th scope="row" className="h-11 font-normal text-muted-foreground">
                        {r.label}
                      </th>
                      {(['a', 'b'] as const).map((side) => {
                        const value = side === 'a' ? r.a : r.b
                        const on = choosable && picks![r.field as MergeField] === side
                        return (
                          <td key={side} className="pe-4">
                            {choosable ? (
                              <label className="flex cursor-pointer items-center gap-2">
                                <input
                                  type="radio"
                                  name={name}
                                  checked={on}
                                  onChange={() => setPick(r.field as MergeField, side)}
                                  className="size-4 shrink-0 accent-primary"
                                />
                                <span
                                  className={cn(
                                    'truncate',
                                    on ? 'text-foreground' : 'text-muted-foreground',
                                  )}
                                >
                                  {value || '—'}
                                </span>
                              </label>
                            ) : (
                              <span className="text-foreground">{value}</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="flex items-center gap-2 rounded-md bg-muted px-4 py-3 text-small text-muted-foreground">
              <Icon name="check" size={14} />
              Result: 1 customer · {selected.a.tickets + selected.b.tickets} tickets · keeps{' '}
              {selected.b.externalId}
            </p>
          </section>
        </div>
      )}
    </ListPageTemplate>
  )
}
