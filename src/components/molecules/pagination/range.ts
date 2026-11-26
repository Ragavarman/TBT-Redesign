export type PageToken = number | 'ellipsis-start' | 'ellipsis-end'

/**
 * Page numbers to show — always `siblings * 2 + 5` slots (7 by default), so the control
 * never changes width: first, last, the current page ± `siblings`, and ellipses for gaps.
 *
 * paginationRange(1, 10)  → [1, 2, 3, 4, 5, '…', 10]
 * paginationRange(5, 10)  → [1, '…', 4, 5, 6, '…', 10]
 * paginationRange(10, 10) → [1, '…', 6, 7, 8, 9, 10]
 */
export function paginationRange(page: number, pageCount: number, siblings = 1): PageToken[] {
  const total = Math.max(1, pageCount)
  const current = Math.min(Math.max(1, page), total)
  const slots = siblings * 2 + 5
  const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i)

  if (total <= slots) return range(1, total)
  if (current <= slots - 3) return [...range(1, slots - 2), 'ellipsis-end', total]
  if (current >= total - (slots - 4))
    return [1, 'ellipsis-start', ...range(total - (slots - 3), total)]
  return [
    1,
    'ellipsis-start',
    ...range(current - siblings, current + siblings),
    'ellipsis-end',
    total,
  ]
}
