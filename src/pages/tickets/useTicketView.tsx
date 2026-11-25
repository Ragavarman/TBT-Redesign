import { useMemo, useState } from 'react'
import { Button } from '@/components/atoms'
import { toast } from '@/components/molecules'
import { DisplayPopover, FilterPopover, SaveViewDialog } from '@/components/organisms'
import { useHotkeys } from '@/hooks/useHotkeys'
import type { Ticket } from '@/types'
import {
  activeFilters,
  applyFilters,
  DEFAULT_DISPLAY,
  DENSITIES,
  describeCondition,
  FILTER_FIELDS,
  GROUPINGS,
  newCondition,
  orderTickets,
  ORDERINGS,
  ROW_PROPS,
  type DisplayOptions,
  type FilterCondition,
  type FilterField,
  type SavedView,
  type ViewVisibility,
} from './ticket-view'

const VISIBILITIES = [
  { value: 'me', label: 'Only me', description: 'Shows under Views in your sidebar' },
  { value: 'team', label: 'Support Team Alpha', description: 'Everyone in the team gets it' },
  { value: 'everyone', label: 'Everyone', description: 'All agents in TBT Support' },
]

/** "My tickets · Needs first response, Investigating" — the list plus its first filter's values. */
function suggestName(title: string, active: FilterCondition[]) {
  const first = active[0]
  if (!first) return title
  const def = FILTER_FIELDS.find((f) => f.id === first.field)!
  const values = first.values.map((v) => def.options.find((o) => o.value === v)?.label ?? v)
  return `${title} · ${values.join(', ')}`
}

export interface UseTicketViewOptions {
  /** Tickets before the agent's own filters (the view's base set). */
  tickets: Ticket[]
  initialFilters?: FilterCondition[]
  initialDisplay?: Partial<DisplayOptions>
  /** Hide grouping / density (the table has its own columns and rows). */
  layout: 'list' | 'table'
  /** Save as view → the app adds it to the sidebar. Omit to hide the button. */
  onSaveView?: (view: SavedView) => void
  /** The list's name — the start of a new view's suggested name. */
  title: string
  /** Story hook: open a control on load (Figma X3 / X4 / T6). */
  initialOpen?: 'filters' | 'display' | 'save'
}

/**
 * The filters + display state behind a ticket list, the Filters / Display buttons with their
 * popovers, the Save view dialog, and the F / V shortcuts.
 */
export function useTicketView({
  tickets,
  initialFilters = [],
  initialDisplay,
  layout,
  title,
  onSaveView,
  initialOpen,
}: UseTicketViewOptions) {
  const [filters, setFilters] = useState<FilterCondition[]>(initialFilters)
  const [display, setDisplay] = useState<DisplayOptions>({ ...DEFAULT_DISPLAY, ...initialDisplay })
  const [open, setOpen] = useState<'filters' | 'display' | null>(
    initialOpen === 'save' ? null : (initialOpen ?? null),
  )
  const [saving, setSaving] = useState(initialOpen === 'save')

  const shown = useMemo(
    () => orderTickets(applyFilters(tickets, filters), display.ordering),
    [tickets, filters, display.ordering],
  )
  const active = activeFilters(filters)

  useHotkeys({
    f: () => setOpen('filters'),
    v: () => setOpen('display'),
  })

  const controls = (
    <>
      <FilterPopover
        fields={FILTER_FIELDS}
        conditions={filters}
        onAdd={(field) => setFilters((f) => [...f, newCondition(field as FilterField)])}
        onChange={(id, patch) =>
          setFilters((f) =>
            f.map((c) => (c.id === id ? ({ ...c, ...patch } as FilterCondition) : c)),
          )
        }
        onRemove={(id) => setFilters((f) => f.filter((c) => c.id !== id))}
        onClear={() => setFilters([])}
        matchLabel={`${shown.length} ${shown.length === 1 ? 'ticket matches' : 'tickets match'}`}
        onSaveView={
          onSaveView &&
          (() => {
            setOpen(null)
            setSaving(true)
          })
        }
        open={open === 'filters'}
        onOpenChange={(o) => setOpen(o ? 'filters' : null)}
        trigger={
          <Button variant="ghost" leadingIcon="filter" shortcut="F">
            {active.length ? `Filters · ${active.length}` : 'Filters'}
          </Button>
        }
      />
      <DisplayPopover
        value={display}
        onChange={(patch) => setDisplay((d) => ({ ...d, ...patch }) as DisplayOptions)}
        onReset={() => setDisplay({ ...DEFAULT_DISPLAY, ...initialDisplay })}
        groupings={layout === 'list' ? GROUPINGS : undefined}
        orderings={ORDERINGS}
        densities={layout === 'list' ? DENSITIES : undefined}
        properties={ROW_PROPS}
        open={open === 'display'}
        onOpenChange={(o) => setOpen(o ? 'display' : null)}
        trigger={
          <Button variant="ghost" leadingIcon="display" shortcut="V">
            Display
          </Button>
        }
      />
    </>
  )

  const saveDialog = onSaveView && (
    <SaveViewDialog
      // fresh form each time it opens
      key={saving ? 'open' : 'closed'}
      open={saving}
      onOpenChange={setSaving}
      defaultName={suggestName(title, active)}
      filterSummary={active.map(describeCondition)}
      visibilities={VISIBILITIES}
      defaultVisibility="team"
      onSave={({ name, visibility, favorite }) => {
        onSaveView({
          id: `view-${Date.now().toString(36)}`,
          name,
          filters: active,
          display,
          visibility: visibility as ViewVisibility,
          favorite,
        })
        toast.success(`Saved “${name}”${favorite ? ' · added to Favorites' : ''}`)
      }}
    />
  )

  return { filters, display, shown, controls, saveDialog }
}
