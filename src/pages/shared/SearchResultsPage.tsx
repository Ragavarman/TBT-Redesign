import { useState, type ReactNode } from 'react'
import { Button, Icon, Input, StatusGlyph, type IconName } from '@/components/atoms'
import { EmptyState, Select } from '@/components/molecules'
import { AppShell, Panel, PanelBody } from '@/components/templates'
import { cn } from '@/lib/utils'
import { SEARCH_GROUPS, type SearchGroup, type SearchHit } from '@/app/search-index'

const GROUP_ICON: Record<SearchGroup, IconName> = {
  Tickets: 'inbox',
  Customers: 'customers',
  Knowledge: 'knowledge',
  Inventory: 'inventory',
}
const STATUS = ['any', 'open', 'resolved'] as const

export interface SearchResultsPageProps {
  sidebar: ReactNode
  query: string
  onQuery: (q: string) => void
  /** Every hit for the query. */
  hits: SearchHit[]
  /** For no results: queries with fewer words that do match. */
  suggestions: { query: string; count: number }[]
  onOpen: (hit: SearchHit) => void
}

/** Figma X28 · Search results, and H7 · No results. */
export function SearchResultsPage({
  sidebar,
  query,
  onQuery,
  hits,
  suggestions,
  onOpen,
}: SearchResultsPageProps) {
  const [tab, setTab] = useState<SearchGroup | 'All'>('All')
  const [status, setStatus] = useState<(typeof STATUS)[number]>('any')
  const [draft, setDraft] = useState(query)

  const byStatus = hits.filter(
    (h) =>
      !h.status ||
      status === 'any' ||
      (status === 'resolved') === (h.status === 'resolved' || h.status === 'closed'),
  )
  const shown = byStatus.filter((h) => tab === 'All' || h.group === tab)
  const count = (g: SearchGroup | 'All') =>
    g === 'All' ? byStatus.length : byStatus.filter((h) => h.group === g).length
  const filtered = status !== 'any' || tab !== 'All'

  return (
    <AppShell sidebar={sidebar}>
      <Panel>
        <header className="flex min-h-13 shrink-0 items-center gap-3 border-b px-4">
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault()
              onQuery(draft.trim())
            }}
          >
            <Input
              leadingIcon="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onClear={draft ? () => (setDraft(''), onQuery('')) : undefined}
              aria-label="Search"
              placeholder="Search tickets, customers, notes and items"
              className="border-0 bg-transparent text-title"
              autoFocus
            />
          </form>
          {query && (
            <span className="text-small whitespace-nowrap text-muted-foreground tabular-nums">
              {hits.length} results
            </span>
          )}
        </header>
        {query && (
          <div className="flex items-center gap-1 border-b px-4 py-2">
            {(['All', ...SEARCH_GROUPS] as const).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setTab(g)}
                aria-pressed={tab === g}
                className={cn(
                  'rounded-md px-2 py-1 text-small',
                  tab === g
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {g} <span className="text-muted-foreground tabular-nums">{count(g)}</span>
              </button>
            ))}
            <span className="flex-1" />
            <Select
              size="sm"
              aria-label="Ticket status"
              value={status}
              onValueChange={(v) => setStatus(v as typeof status)}
              options={STATUS.map((s) => ({ value: s, label: `Status: ${s}` }))}
              className="w-36"
            />
          </div>
        )}
        <PanelBody>
          {!query ? (
            <EmptyState
              className="mt-24"
              icon="search"
              title="Search everything"
              description="Tickets, customers, notes and inventory. Press Ctrl K from anywhere for quick results."
            />
          ) : !shown.length ? (
            <div className="mx-auto mt-24 flex max-w-100 flex-col items-center gap-4">
              <EmptyState
                type="no-results"
                title={`No ${tab === 'All' ? 'results' : tab.toLowerCase()} match “${query}”`}
                description={
                  filtered
                    ? 'Your filters may be hiding them. Try fewer words or search every status.'
                    : 'Try fewer words, a ticket number or a phone number.'
                }
                action={
                  <div className="flex gap-2">
                    {filtered && (
                      <Button size="sm" onClick={() => (setTab('All'), setStatus('any'))}>
                        Clear filters
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => (setDraft(''), onQuery(''))}
                    >
                      New search
                    </Button>
                  </div>
                }
              />
              {suggestions.length > 0 && (
                <div className="flex w-full flex-col gap-1 px-6 text-small">
                  <span className="text-muted-foreground">Did you mean</span>
                  {suggestions.map((s) => (
                    <button
                      key={s.query}
                      type="button"
                      className="text-start text-foreground hover:underline"
                      onClick={() => (setDraft(s.query), onQuery(s.query))}
                    >
                      {s.query} · {s.count} {s.count === 1 ? 'result' : 'results'}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 p-4">
              {SEARCH_GROUPS.filter((g) => shown.some((h) => h.group === g)).map((g) => {
                const hs = shown.filter((h) => h.group === g)
                return (
                  <section key={g} className="flex flex-col">
                    <h2 className="px-2 pb-1 text-small text-muted-foreground">
                      {g} · {hs.length}
                    </h2>
                    {hs.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => onOpen(h)}
                        className="flex items-start gap-3 rounded-md px-2 py-2 text-start outline-none hover:bg-accent focus-visible:bg-accent"
                      >
                        <span className="mt-0.5">
                          {h.status ? (
                            <StatusGlyph status={h.status} label={null} />
                          ) : (
                            <Icon
                              name={GROUP_ICON[h.group]}
                              size={16}
                              className="text-muted-foreground"
                            />
                          )}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-body text-foreground">{h.title}</span>
                          <span className="truncate text-small text-muted-foreground">
                            {h.snippet ?? h.detail}
                          </span>
                        </span>
                        {h.meta && (
                          <span className="text-small whitespace-nowrap text-muted-foreground">
                            {h.meta}
                          </span>
                        )}
                      </button>
                    ))}
                  </section>
                )
              })}
            </div>
          )}
        </PanelBody>
      </Panel>
    </AppShell>
  )
}
