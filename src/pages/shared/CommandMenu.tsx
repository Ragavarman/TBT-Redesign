import { useState } from 'react'
import { Icon, Kbd, StatusGlyph, type IconName } from '@/components/atoms'
import { Dialog as UiDialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { SearchGroup, SearchHit } from '@/app/search-index'

export interface CommandAction {
  id: string
  label: string
  icon: IconName
  keys?: string
  run: () => void
}

export interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  search: (q: string) => SearchHit[]
  actions: CommandAction[]
  onOpenHit: (hit: SearchHit) => void
  /** Enter on "See all results", or Ctrl+Enter. */
  onSeeAll: (q: string) => void
}

const GROUP_ICON: Record<SearchGroup, IconName> = {
  Tickets: 'inbox',
  Customers: 'customers',
  Knowledge: 'knowledge',
  Inventory: 'inventory',
}
const FILTERS: (SearchGroup | 'All')[] = ['All', 'Tickets', 'Customers', 'Knowledge', 'Inventory']
const PER_GROUP = 4

type Row =
  { kind: 'hit'; hit: SearchHit } | { kind: 'action'; action: CommandAction } | { kind: 'all' }

/** Figma H1 · Ctrl K — search everything and run actions from the keyboard. */
export function CommandMenu({
  open,
  onOpenChange,
  search,
  actions,
  onOpenHit,
  onSeeAll,
}: CommandMenuProps) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState(0)
  const [active, setActive] = useState(0)

  const type = FILTERS[filter]!
  const hits = search(q).filter((h) => type === 'All' || h.group === type)
  const shown =
    type === 'All' ? groupsOf(hits).flatMap(([, hs]) => hs.slice(0, PER_GROUP)) : hits.slice(0, 12)
  const matchedActions =
    type === 'All'
      ? actions.filter((a) => a.label.toLowerCase().includes(q.trim().toLowerCase()))
      : []
  const rows: Row[] = [
    ...shown.map((hit) => ({ kind: 'hit' as const, hit })),
    ...matchedActions.map((action) => ({ kind: 'action' as const, action })),
    ...(q.trim() && hits.length > shown.length ? [{ kind: 'all' as const }] : []),
  ]
  const current = Math.min(active, rows.length - 1)

  const close = () => {
    onOpenChange(false)
    setQ('')
    setFilter(0)
    setActive(0)
  }
  const run = (r: Row | undefined) => {
    if (!r) return
    close()
    if (r.kind === 'hit') onOpenHit(r.hit)
    else if (r.kind === 'action') r.action.run()
    else onSeeAll(q.trim())
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      const d = e.key === 'ArrowDown' ? 1 : -1
      setActive((a) => (Math.min(a, rows.length - 1) + d + rows.length) % Math.max(rows.length, 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if ((e.ctrlKey || e.metaKey) && q.trim()) {
        close()
        onSeeAll(q.trim())
      } else run(rows[current])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      setFilter((f) => (f + (e.shiftKey ? FILTERS.length - 1 : 1)) % FILTERS.length)
      setActive(0)
    }
  }

  const keyOf = (r: Row) =>
    r.kind === 'hit' ? r.hit.id : r.kind === 'action' ? r.action.id : 'all'
  const item = (r: Row, body: React.ReactNode, key: string) => {
    const idx = rows.findIndex((x) => keyOf(x) === key)
    return (
      <li
        key={key}
        role="option"
        aria-selected={idx === current}
        onMouseMove={() => setActive(idx)}
        onClick={() => run(r)}
        className={cn(
          'flex h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-body',
          idx === current && 'bg-accent',
        )}
      >
        {body}
        <Icon
          name="reply"
          size={14}
          aria-hidden
          className={cn(
            'shrink-0 text-muted-foreground',
            r.kind !== 'action' && 'ms-auto',
            idx !== current && 'invisible',
          )}
        />
      </li>
    )
  }

  return (
    <UiDialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent
        className="top-[15%] max-w-160 translate-y-0 gap-0 p-0"
        aria-describedby={undefined}
        onKeyDown={onKeyDown}
      >
        <DialogTitle className="sr-only">Command menu</DialogTitle>
        <div className="flex items-center gap-2 border-b px-3">
          <Icon name="search" size={16} className="text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => (setQ(e.target.value), setActive(0))}
            placeholder="Search tickets, customers, notes… or type a command"
            aria-label="Search"
            role="combobox"
            aria-expanded
            className="h-12 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground"
          />
          {type !== 'All' && (
            <span className="rounded-md bg-secondary px-1.5 py-0.5 text-small text-secondary-foreground">
              {type}
            </span>
          )}
        </div>
        <ul role="listbox" aria-label="Results" className="max-h-100 overflow-y-auto p-1.5">
          {type === 'All'
            ? groupsOf(shown).map(([g, hs]) => (
                <Group key={g} label={g}>
                  {hs.map((h) => item({ kind: 'hit', hit: h }, <HitBody hit={h} />, h.id))}
                </Group>
              ))
            : shown.map((h) => item({ kind: 'hit', hit: h }, <HitBody hit={h} />, h.id))}
          {matchedActions.length > 0 && (
            <Group label="Actions">
              {matchedActions.map((a) =>
                item(
                  { kind: 'action', action: a },
                  <>
                    <Icon name={a.icon} size={16} className="text-muted-foreground" />
                    <span>{a.label}</span>
                    {a.keys && <Kbd className="ms-auto">{a.keys}</Kbd>}
                  </>,
                  a.id,
                ),
              )}
            </Group>
          )}
          {rows.some((r) => r.kind === 'all') &&
            item(
              { kind: 'all' },
              <>
                <Icon name="search" size={16} className="text-muted-foreground" />
                <span>
                  See all {hits.length} results for “{q.trim()}”
                </span>
              </>,
              'all',
            )}
          {!rows.length && (
            <li className="px-2 py-6 text-center text-body text-muted-foreground">
              Nothing matches “{q.trim()}”.{' '}
              <button
                type="button"
                className="text-foreground underline"
                onClick={() => (close(), onSeeAll(q.trim()))}
              >
                Search all tickets
              </button>
            </li>
          )}
        </ul>
        <footer className="flex items-center gap-4 border-t px-3 py-2 text-small text-muted-foreground">
          <span className="flex items-center gap-1">
            <Kbd>↑↓</Kbd> Move
          </span>
          <span className="flex items-center gap-1">
            <Kbd>↵</Kbd> Open
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Tab</Kbd> Filter by type
          </span>
          <span className="ms-auto flex items-center gap-1">
            <Kbd>Ctrl ↵</Kbd> All results
          </span>
        </footer>
      </DialogContent>
    </UiDialog>
  )
}

function groupsOf(hits: SearchHit[]) {
  const m = new Map<SearchGroup, SearchHit[]>()
  for (const h of hits) m.set(h.group, [...(m.get(h.group) ?? []), h])
  return [...m.entries()]
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <li role="presentation" className="px-2 pt-2 pb-1 text-small text-muted-foreground">
        {label}
      </li>
      {children}
    </>
  )
}

function HitBody({ hit }: { hit: SearchHit }) {
  return (
    <>
      {hit.status ? (
        <StatusGlyph status={hit.status} label={null} />
      ) : (
        <Icon name={GROUP_ICON[hit.group]} size={16} className="text-muted-foreground" />
      )}
      <span className="truncate text-foreground">{hit.title}</span>
      <span className="truncate text-small text-muted-foreground">{hit.detail}</span>
    </>
  )
}
