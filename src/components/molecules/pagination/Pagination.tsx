import type { ComponentProps, ReactNode } from 'react'
import { Icon } from '@/components/atoms'
import { FIELD } from '@/lib/optical'
import { cn } from '@/lib/utils'
import { paginationRange } from './range'

// optical padding: Small 13/18 + --py → 28px. Numbers: min-width = height (square for 1–2
// digits, grows for more). Prev/next: icon-only squares.
const pageBase = cn(
  'inline-flex shrink-0 items-center justify-center rounded-sm border border-transparent [--bw:1px] [--icon:14px]',
  FIELD.sm,
  'text-muted-foreground transition-[background-color,color] duration-150 outline-none',
  'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
  'disabled:pointer-events-none disabled:opacity-50',
  'aria-[current=page]:border-border aria-[current=page]:bg-card aria-[current=page]:text-label aria-[current=page]:text-foreground',
)
const pageButton = cn(pageBase, 'min-w-[calc(var(--slot)+2*var(--py))] optical tabular-nums')
const pageArrow = cn(pageBase, 'optical-square')

export interface PaginationProps extends Omit<ComponentProps<'nav'>, 'onChange'> {
  /** Current page, 1-based. */
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  /** Pages shown either side of the current one. Default 1. */
  siblings?: number
  /** Text on the left, e.g. "1–25 of 67". */
  range?: ReactNode
  /**
   * `bar` (default) — full-width footer strip with card fill and top border, as under a table.
   * `inline` — just the page buttons.
   */
  appearance?: 'bar' | 'inline'
}

/** Page navigation (Figma 07 · Pagination / Page button): prev · numbers · ellipsis · next. */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblings = 1,
  range,
  appearance = 'bar',
  className,
  ...props
}: PaginationProps) {
  const pages = paginationRange(page, pageCount, siblings)
  const go = (p: number) => p !== page && p >= 1 && p <= pageCount && onPageChange(p)

  return (
    <nav
      aria-label="Pagination"
      data-slot="pagination"
      className={cn(
        'flex items-center gap-1',
        appearance === 'bar' && 'w-full border-t bg-card px-4 py-2',
        className,
      )}
      {...props}
    >
      {range !== undefined && (
        <span className="mr-auto pr-4 text-small text-muted-foreground">{range}</span>
      )}
      <button
        type="button"
        className={pageArrow}
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => go(page - 1)}
      >
        <Icon name="chevron-left" size={14} />
      </button>
      {pages.map((p) =>
        typeof p === 'number' ? (
          <button
            key={p}
            type="button"
            className={pageButton}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
            onClick={() => go(p)}
          >
            {p}
          </button>
        ) : (
          <span key={p} aria-hidden className={cn(pageButton, 'pointer-events-none')}>
            …
          </span>
        ),
      )}
      <button
        type="button"
        className={pageArrow}
        aria-label="Next page"
        disabled={page >= pageCount}
        onClick={() => go(page + 1)}
      >
        <Icon name="chevron-right" size={14} />
      </button>
    </nav>
  )
}
