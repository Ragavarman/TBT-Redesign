import { useId, type ComponentProps, type ReactNode } from 'react'
import { Tooltip } from '@/components/molecules'
import { rem } from '@/lib/units'
import { cn } from '@/lib/utils'

export interface BarSeries {
  key: string
  label: string
  /** Bar fill: a bg-* class. Assign in a fixed order; never derive it from rank. */
  fill: string
}

export interface BarDatum {
  /** Category on the x axis, e.g. "Nov 11". */
  label: string
  values: Record<string, number>
}

export interface BarChartProps extends Omit<ComponentProps<'figure'>, 'children'> {
  data: BarDatum[]
  series: BarSeries[]
  /** Accessible name of the chart (also the caption of the screen-reader table). */
  label: string
  /** Emphasise one bar, e.g. the peak day: its fill is replaced and its x label turns foreground. */
  highlight?: { index: number; series: string; fill: string }
  /** Plot height in px. Default 200. */
  height?: number
  /** Value formatter for the tooltip and the table. */
  format?: (value: number) => ReactNode
}

const GRID = [0.25, 0.5, 0.75, 1]

/**
 * Top of the scale: four grid steps, each rounded up to 1, 2, 2.5 or 5 times a power of ten,
 * so the lines land on readable values and the tallest bar fills most of the plot (65 → 80).
 */
function niceMax(v: number) {
  if (v <= 0) return 1
  const step = v / GRID.length
  const p = 10 ** Math.floor(Math.log10(step))
  const n = step / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p * GRID.length
}

/**
 * Grouped vertical bars (Figma Interface · Created vs resolved). 28px bars with 4px rounded
 * tops on a shared baseline, recessive grid, x labels in Caption. Each category is one hover /
 * focus target with a tooltip of all its values; a visually hidden table carries the data.
 */
export function BarChart({
  data,
  series,
  label,
  highlight,
  height = 200,
  format = (v) => v,
  className,
  ...props
}: BarChartProps) {
  const id = useId()
  const max = niceMax(Math.max(0, ...data.flatMap((d) => series.map((s) => d.values[s.key] ?? 0))))
  return (
    <figure
      data-slot="bar-chart"
      aria-labelledby={id}
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      <div className="relative" style={{ height: rem(height) }}>
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {GRID.map((g) => (
            <span
              key={g}
              className="absolute inset-x-0 border-t"
              style={{ bottom: `${g * 100}%` }}
            />
          ))}
          <span className="absolute inset-x-0 bottom-0 border-t" />
        </div>
        <div className="relative flex h-full">
          {data.map((d, i) => (
            <Tooltip
              key={d.label}
              side="top"
              content={
                <span className="flex min-w-32 flex-col gap-0.5 py-0.5">
                  <span>{d.label}</span>
                  {series.map((s) => (
                    <span key={s.key} className="flex items-center gap-1.5">
                      <span aria-hidden className={cn('size-2 rounded-[2px]', s.fill)} />
                      {s.label}
                      <span className="ms-auto ps-3 tabular-nums">
                        {format(d.values[s.key] ?? 0)}
                      </span>
                    </span>
                  ))}
                </span>
              }
            >
              <div
                tabIndex={0}
                aria-label={`${d.label}: ${series.map((s) => `${s.label} ${d.values[s.key] ?? 0}`).join(', ')}`}
                className="flex flex-1 items-end justify-center gap-1 rounded-t-sm outline-none hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
              >
                {series.map((s) => {
                  const v = d.values[s.key] ?? 0
                  const hl = highlight?.index === i && highlight.series === s.key
                  return (
                    <span
                      key={s.key}
                      data-series={s.key}
                      className={cn('w-7 shrink-0 rounded-t-[4px]', hl ? highlight.fill : s.fill)}
                      style={{ height: `${(v / max) * 100}%` }}
                    />
                  )
                })}
              </div>
            </Tooltip>
          ))}
        </div>
      </div>
      <div aria-hidden className="flex">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={cn(
              'flex-1 truncate text-center text-caption',
              highlight?.index === i ? 'text-foreground' : 'text-muted-foreground',
            )}
          >
            {d.label}
          </span>
        ))}
      </div>
      <figcaption id={id} className="sr-only">
        {label}
      </figcaption>
      <table className="sr-only">
        <caption>{label}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            {series.map((s) => (
              <th key={s.key} scope="col">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.label}>
              <th scope="row">{d.label}</th>
              {series.map((s) => (
                <td key={s.key}>{format(d.values[s.key] ?? 0)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
