import {
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  sortFn_datetime,
  sortFn_text,
  tableFeatures,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table'

/** Per-column layout hints read by DataTable. */
export interface DataTableColumnMeta {
  /** Right-align numbers and dates. */
  align?: 'left' | 'right'
  /** Fixed column width in px (e.g. 140). Omit to share the remaining space. */
  width?: number
  /** Extra classes for this column's cells (header and body). */
  className?: string
}

/**
 * TanStack Table v9 feature set used by every DataTable: client sorting, row selection,
 * client pagination and typed column `meta`. Module-scope so it stays stable.
 */
export const dataTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    datetime: sortFn_datetime,
    basic: sortFn_basic,
  },
  rowSelectionFeature,
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
  columnMeta: metaHelper<DataTableColumnMeta>(),
})

export type DataTableFeatures = typeof dataTableFeatures

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- columns hold heterogeneous value types
export type DataTableColumn<TData extends RowData> = ColumnDef<DataTableFeatures, TData, any>

/**
 * Typed column helper for DataTable. Define columns at module scope:
 *
 * ```ts
 * const col = createDataTableColumns<Ticket>()
 * const columns = col.columns([
 *   col.accessor('subject', { header: 'Subject' }),
 *   col.accessor('updatedAt', { header: 'Updated', meta: { align: 'right', width: 120 } }),
 * ])
 * ```
 */
export function createDataTableColumns<TData extends RowData>() {
  return createColumnHelper<DataTableFeatures, TData>()
}
