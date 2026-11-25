import { useRef, useState, type ComponentProps, type KeyboardEvent } from 'react'
import { IconButton } from '@/components/atoms'
import { cn } from '@/lib/utils'
import { addDays, addMonths, DAY, monthOf, todayUTC, toTime, weekday } from './dates'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const monthTitle = (month: string) =>
  new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${month}-01T00:00:00Z`),
  )
const fullDate = (d: string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'full', timeZone: 'UTC' }).format(
    new Date(toTime(d)),
  )

export interface CalendarProps extends Omit<ComponentProps<'div'>, 'onChange'> {
  /** Selected day, "YYYY-MM-DD". */
  value?: string
  onChange: (day: string) => void
  /** Earliest pickable day; earlier days are disabled. */
  min?: string
  /** Highlighted as today. */
  today?: string
}

/**
 * Month grid (Figma Interface · X5 Snooze): Monday-first weeks, prev / next month, days outside
 * the month muted. Arrow keys move by day / week, Home / End to the week's ends, Enter picks.
 */
export function Calendar({ value, onChange, min, today, className, ...props }: CalendarProps) {
  const [month, setMonth] = useState(() => monthOf(value ?? today ?? todayUTC()))
  const [focused, setFocused] = useState(() => value ?? today ?? `${month}-01`)
  const grid = useRef<HTMLDivElement>(null)

  const first = `${month}-01`
  const start = addDays(first, -weekday(first))
  const nextMonth = `${addMonths(month, 1)}-01`
  const weeks = Math.ceil((toTime(nextMonth) - toTime(start)) / DAY / 7)
  const days = Array.from({ length: weeks * 7 }, (_, i) => addDays(start, i))

  const move = (d: string) => {
    if (min && d < min) return
    setFocused(d)
    if (monthOf(d) !== month) setMonth(monthOf(d))
    requestAnimationFrame(() =>
      grid.current?.querySelector<HTMLButtonElement>(`[data-day="${d}"]`)?.focus(),
    )
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const step: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -weekday(focused),
      End: 6 - weekday(focused),
    }
    const n = step[e.key]
    if (n === undefined) return
    e.preventDefault()
    move(addDays(focused, n))
  }

  return (
    <div
      data-slot="calendar"
      className={cn('flex flex-col gap-2 rounded-md border p-3', className)}
      {...props}
    >
      <div className="flex items-center gap-1">
        <h3 aria-live="polite" className="flex-1 text-title text-foreground">
          {monthTitle(month)}
        </h3>
        <IconButton
          icon="chevron-left"
          label="Previous month"
          size="sm"
          disabled={min !== undefined && monthOf(min) >= month}
          onClick={() => setMonth(addMonths(month, -1))}
        />
        <IconButton
          icon="chevron-right"
          label="Next month"
          size="sm"
          onClick={() => setMonth(addMonths(month, 1))}
        />
      </div>
      <div ref={grid} role="grid" aria-label={monthTitle(month)} onKeyDown={onKeyDown}>
        <div role="row" className="grid grid-cols-7">
          {WEEKDAYS.map((w) => (
            <span
              key={w}
              role="columnheader"
              className="flex h-7 items-center justify-center text-caption text-muted-foreground"
            >
              {w}
            </span>
          ))}
        </div>
        {Array.from({ length: weeks }, (_, w) => (
          <div key={w} role="row" className="grid grid-cols-7">
            {days.slice(w * 7, w * 7 + 7).map((d) => {
              const outside = monthOf(d) !== month
              const disabled = min !== undefined && d < min
              const selected = d === value
              return (
                <span key={d} role="gridcell" aria-selected={selected} className="p-0.5">
                  <button
                    type="button"
                    data-day={d}
                    tabIndex={d === focused ? 0 : -1}
                    disabled={disabled}
                    aria-label={fullDate(d)}
                    aria-current={d === today ? 'date' : undefined}
                    onClick={() => {
                      setFocused(d)
                      onChange(d)
                    }}
                    className={cn(
                      'flex aspect-square w-full items-center justify-center rounded-sm text-small tabular-nums outline-none',
                      'transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                      outside ? 'text-muted-foreground' : 'text-foreground',
                      d === today && !selected && 'font-semibold text-primary',
                      selected && 'bg-primary text-primary-foreground hover:bg-primary',
                      'disabled:pointer-events-none disabled:opacity-40',
                    )}
                  >
                    {Number(d.slice(8))}
                  </button>
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
