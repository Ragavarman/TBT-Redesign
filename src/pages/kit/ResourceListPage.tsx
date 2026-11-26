import { useMemo, useRef, useState, type ReactNode } from 'react'
import { Avatar, Button, Icon, Input, type IconName } from '@/components/atoms'
import { EmptyState } from '@/components/molecules'
import { PageHeader } from '@/components/organisms'
import { ListPageTemplate } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import { cn } from '@/lib/utils'

/**
 * Shared list page for the record lists in Knowledge, Inventory, Team and Settings: header with
 * count and actions, search (/), a sortable table, click a row to open it, and an empty state.
 */

export interface ResourceColumn<T> {
  key: string
  label: string
  /** Fixed width in rem-friendly Tailwind (e.g. 'w-40'); omit for the flexible column. */
  className?: string
  /** Sort value; defaults to the rendered text when it's a string or number. */
  sort?: (row: T) => string | number
  render: (row: T) => ReactNode
}

export interface ResourceListPageProps<T> {
  sidebar: ReactNode
  icon: IconName
  title: string
  /** Shown after the title; defaults to the number of rows. */
  count?: ReactNode
  rows: T[]
  getId: (row: T) => string
  columns: ResourceColumn<T>[]
  /** Text the search matches against. Omit to hide search. */
  searchText?: (row: T) => string
  searchPlaceholder?: string
  onRowClick?: (row: T) => void
  /** Header buttons (New …, Import, Filter). */
  actions?: ReactNode
  /** Under the header, above search (banners, tabs). */
  toolbar?: ReactNode
  empty?: { icon?: IconName; title: string; description?: string; action?: ReactNode }
  /** Overlays: the edit sheet, dialogs. */
  children?: ReactNode
}

export function ResourceListPage<T>({
  sidebar,
  icon,
  title,
  count,
  rows,
  getId,
  columns,
  searchText,
  searchPlaceholder = 'Search',
  onRowClick,
  actions,
  toolbar,
  empty,
  children,
}: ResourceListPageProps<T>) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null)
  const search = useRef<HTMLInputElement>(null)
  useHotkeys({ '/': () => search.current?.focus() })

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = q && searchText ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : rows
    const col = sort && columns.find((c) => c.key === sort.key)
    if (col?.sort) {
      const by = col.sort
      list = [...list].sort((a, b) => {
        const x = by(a)
        const y = by(b)
        return (
          (typeof x === 'number' && typeof y === 'number'
            ? x - y
            : String(x).localeCompare(String(y))) * sort!.dir
        )
      })
    }
    return list
  }, [rows, query, searchText, sort, columns])

  return (
    <ListPageTemplate
      sidebar={sidebar}
      header={
        <PageHeader icon={icon} title={title} count={count ?? rows.length} actions={actions} />
      }
      toolbar={
        toolbar || searchText ? (
          <>
            {toolbar}
            {searchText && rows.length > 0 && (
              <div className="px-4 py-2">
                <Input
                  ref={search}
                  type="search"
                  leadingIcon="search"
                  shortcut="/"
                  aria-label={`Search ${title.toLowerCase()}`}
                  placeholder={searchPlaceholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onClear={query ? () => setQuery('') : undefined}
                  wrapperClassName="max-w-96"
                />
              </div>
            )}
          </>
        ) : undefined
      }
    >
      {rows.length === 0 && empty ? (
        <div className="flex h-full items-center justify-center p-6">
          <EmptyState
            icon={empty.icon ?? icon}
            title={empty.title}
            description={empty.description}
            action={empty.action}
          />
        </div>
      ) : shown.length === 0 ? (
        <div className="flex h-80 items-center justify-center p-6">
          <EmptyState type="no-results" title="Nothing matches" description="Try another search." />
        </div>
      ) : (
        <table className="w-full text-left text-body">
          <thead className="sticky top-0 z-10 border-b bg-card text-small text-muted-foreground">
            <tr>
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={cn(
                    'h-10 font-normal',
                    i === 0 && 'ps-4',
                    i === columns.length - 1 && 'pe-4',
                    c.className,
                  )}
                >
                  {c.sort ? (
                    <button
                      type="button"
                      onClick={() =>
                        setSort((s) =>
                          s?.key === c.key
                            ? s.dir === 1
                              ? { key: c.key, dir: -1 }
                              : null
                            : { key: c.key, dir: 1 },
                        )
                      }
                      className="inline-flex cursor-pointer items-center gap-1 rounded-xs outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      aria-sort={
                        sort?.key === c.key
                          ? sort.dir === 1
                            ? 'ascending'
                            : 'descending'
                          : undefined
                      }
                    >
                      {c.label}
                      <Icon
                        name={
                          sort?.key === c.key
                            ? sort.dir === 1
                              ? 'arrow-up'
                              : 'arrow-down'
                            : 'chevrons-up-down'
                        }
                        size={12}
                      />
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr
                key={getId(r)}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick && (() => onRowClick(r))}
                onKeyDown={
                  onRowClick &&
                  ((e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onRowClick(r)
                    }
                  })
                }
                className={cn(
                  'border-b outline-none',
                  onRowClick &&
                    'cursor-pointer transition-colors duration-150 hover:bg-accent focus-visible:bg-accent',
                )}
              >
                {columns.map((c, i) => (
                  <td
                    key={c.key}
                    className={cn('h-11', i === 0 && 'ps-4', i === columns.length - 1 && 'pe-4')}
                  >
                    {c.render(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {children}
    </ListPageTemplate>
  )
}

/** Avatar + name, for person columns. */
export function PersonCell({ name }: { name: string }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Avatar name={name} size="xs" aria-hidden />
      <span className="truncate text-muted-foreground">{name}</span>
    </span>
  )
}

/** Secondary button that opens something (convenience for actions). */
export function ActionButton({
  children,
  onClick,
  icon,
}: {
  children: ReactNode
  onClick: () => void
  icon?: IconName
}) {
  return (
    <Button variant="secondary" leadingIcon={icon} onClick={onClick}>
      {children}
    </Button>
  )
}
