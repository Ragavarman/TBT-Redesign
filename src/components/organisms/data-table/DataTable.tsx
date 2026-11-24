import {
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react'
import {
  createColumnHelper,
  useTable,
  type RowData,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox, Icon, IconButton, Skeleton } from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  EmptyState,
  Pagination,
} from '@/components/molecules'
import { cn } from '@/lib/utils'
import {
  dataTableFeatures,
  type DataTableColumn,
  type DataTableColumnMeta,
  type DataTableFeatures,
} from './features'

const SELECT_ID = '__select'
const ACTIONS_ID = '__actions'

export interface DataTableProps<TData extends RowData> {
  /** Columns from `createDataTableColumns<T>().columns([...])` — define at module scope. */
  columns: DataTableColumn<TData>[]
  data: TData[]
  /** Stable id per row (used for selection and React keys). */
  getRowId: (row: TData) => string
  /** Accessible name for the table, e.g. "Tickets". */
  label: string
  /** Leading checkbox column + select-all. */
  selectable?: boolean
  /** Controlled selection: `{ [rowId]: true }`. Omit for uncontrolled. */
  rowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  /** Rows per page; `false` shows every row with no footer. Default 25. */
  pageSize?: number | false
  /** Initial sort, e.g. `[{ id: 'updatedAt', desc: true }]`. */
  initialSorting?: SortingState
  /** Show skeleton rows instead of data. */
  loading?: boolean
  /** Shown when there are no rows. Default: a “No results” EmptyState. */
  empty?: ReactNode
  /** Make rows clickable (Enter also triggers). Clicks on buttons/checkboxes inside are ignored. */
  onRowClick?: (row: TData) => void
  /** Trailing “…” menu per row — return DropdownMenuItem elements. Pass a stable function (module scope or useCallback). */
  rowActions?: (row: TData) => ReactNode
  /** Noun for the range text: "1–25 of 67 tickets". */
  itemLabel?: string
  className?: string
}

const isInteractive = (target: EventTarget | null) =>
  target instanceof Element &&
  !!target.closest(
    'button, a, input, select, textarea, [role="menuitem"], [data-row-click="ignore"]',
  )

/** Only what the layout helpers read — avoids threading TanStack generics. */
interface LayoutColumn {
  id: string
  columnDef: { meta?: DataTableColumnMeta }
}

function columnStyle(column: LayoutColumn): CSSProperties | undefined {
  const width = column.columnDef.meta?.width
  return width ? { width, minWidth: width, maxWidth: width } : undefined
}

/**
 * Sortable, selectable, paginated table (Figma 08 · Table / Table in context), built on
 * TanStack Table v9. Data comes in through props; sorting and paging run client-side.
 */
export function DataTable<TData extends RowData>({
  columns,
  data,
  getRowId,
  label,
  selectable,
  rowSelection: rowSelectionProp,
  onRowSelectionChange,
  pageSize = 25,
  initialSorting = [],
  loading,
  empty,
  onRowClick,
  rowActions,
  itemLabel,
  className,
}: DataTableProps<TData>) {
  const [selectionState, setSelectionState] = useState<RowSelectionState>({})
  const rowSelection = rowSelectionProp ?? selectionState

  const allColumns = useMemo(() => {
    const col = createColumnHelper<DataTableFeatures, TData>()
    const extra: DataTableColumn<TData>[] = []
    if (selectable) {
      extra.push(
        col.display({
          id: SELECT_ID,
          meta: { width: 44 },
          enableSorting: false,
          header: ({ table }) => (
            <Checkbox
              aria-label="Select all rows on this page"
              disabled={table.getRowModel().rows.length === 0}
              checked={
                table.getIsAllPageRowsSelected()
                  ? true
                  : table.getIsSomePageRowsSelected()
                    ? 'indeterminate'
                    : false
              }
              onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              aria-label="Select row"
              checked={row.getIsSelected()}
              // click (not change) so Shift+click selects a range
              onClick={row.getToggleSelectedHandler()}
            />
          ),
        }),
      )
    }
    const tail: DataTableColumn<TData>[] = rowActions
      ? [
          col.display({
            id: ACTIONS_ID,
            meta: { width: 44 },
            enableSorting: false,
            header: () => <span className="sr-only">Actions</span>,
            cell: ({ row }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <IconButton icon="dots" label="Row actions" size="sm" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">{rowActions(row.original)}</DropdownMenuContent>
              </DropdownMenu>
            ),
          }),
        ]
      : []
    return [...extra, ...columns, ...tail]
  }, [columns, selectable, rowActions])

  const t = useTable({
    features: dataTableFeatures,
    columns: allColumns,
    data,
    getRowId,
    enableRowSelection: !!selectable,
    initialState: {
      sorting: initialSorting,
      pagination: {
        pageIndex: 0,
        pageSize: pageSize === false ? Math.max(1, data.length) : pageSize,
      },
    },
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === 'function' ? updater(rowSelection) : updater
      if (rowSelectionProp === undefined) setSelectionState(next)
      onRowSelectionChange?.(next)
    },
  })

  const rows = t.getRowModel().rows
  const leafColumns = t.getAllLeafColumns()
  const { pageIndex, pageSize: size } = t.state.pagination
  const total = data.length
  const pageCount = Math.max(1, Math.ceil(total / size))
  const from = total === 0 ? 0 : pageIndex * size + 1
  const to = Math.min(total, (pageIndex + 1) * size)

  const alignClass = (column: LayoutColumn) =>
    cn(
      column.columnDef.meta?.align === 'right' && 'text-right',
      (column.id === SELECT_ID || column.id === ACTIONS_ID) && 'px-0 text-center',
      column.columnDef.meta?.className,
    )

  const onRowActivate = (row: TData) => (e: MouseEvent | KeyboardEvent) => {
    if (!onRowClick || isInteractive(e.target)) return
    if ('key' in e && e.key !== 'Enter') return
    onRowClick(row)
  }

  return (
    <div
      data-slot="data-table"
      className={cn('overflow-hidden rounded-xl border bg-card', className)}
    >
      <Table aria-label={label} aria-busy={loading || undefined}>
        <TableHeader>
          {t.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const column = header.column
                const sorted = column.getIsSorted()
                const canSort = column.getCanSort()
                return (
                  <TableHead
                    key={header.id}
                    style={columnStyle(column)}
                    className={alignClass(column)}
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={column.getToggleSortingHandler()}
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-1 rounded-xs outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
                          sorted && 'text-foreground',
                          column.columnDef.meta?.align === 'right' && 'flex-row-reverse',
                        )}
                      >
                        <t.FlexRender header={header} />
                        <Icon
                          name={
                            sorted === 'asc'
                              ? 'arrow-up'
                              : sorted === 'desc'
                                ? 'arrow-down'
                                : 'chevrons-up-down'
                          }
                          size={12}
                        />
                      </button>
                    ) : (
                      <t.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: Math.min(size, 8) }, (_, i) => (
              <TableRow key={`skeleton-${i}`} className="hover:bg-transparent">
                {leafColumns.map((column) => (
                  <TableCell
                    key={column.id}
                    style={columnStyle(column)}
                    className={alignClass(column)}
                  >
                    {column.id === SELECT_ID ? (
                      <Skeleton shape="block" className="mx-auto size-4" />
                    ) : column.id === ACTIONS_ID ? null : (
                      <Skeleton
                        className={cn(
                          'w-3/4',
                          column.columnDef.meta?.align === 'right' && 'ml-auto w-1/2',
                        )}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={leafColumns.length} className="h-auto">
                {empty ?? (
                  <EmptyState
                    type="no-results"
                    title="No results"
                    description="Try a different filter or search."
                  />
                )}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() ? 'selected' : undefined}
                aria-selected={selectable ? row.getIsSelected() : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? onRowActivate(row.original) : undefined}
                onKeyDown={onRowClick ? onRowActivate(row.original) : undefined}
                className={cn(
                  onRowClick &&
                    'cursor-pointer outline-none focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                )}
              >
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    style={columnStyle(cell.column)}
                    className={cn('max-w-0 truncate', alignClass(cell.column))}
                  >
                    <t.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pageSize !== false && total > 0 && (
        <Pagination
          page={pageIndex + 1}
          pageCount={pageCount}
          onPageChange={(p) => t.setPageIndex(p - 1)}
          range={`${from}–${to} of ${total}${itemLabel ? ` ${itemLabel}` : ''}`}
        />
      )}
    </div>
  )
}
