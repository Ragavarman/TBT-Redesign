import { useState } from 'react'
import { Button, Icon, Switch } from '@/components/atoms'
import { Calendar } from '@/components/molecules'
import { menuItem } from '@/components/ui/menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  formatDay,
  formatRange,
  matchPreset,
  PRESETS,
  presetRange,
  type DateRange,
} from './presets'

export interface DateRangePickerProps {
  value: DateRange
  /** Compare with the previous period of the same length. */
  compare: boolean
  onApply: (v: { range: DateRange; compare: boolean }) => void
  /** "Today" for the presets, "YYYY-MM-DD". Later days can't be picked. */
  today: string
  /** Open on load (stories). */
  defaultOpen?: boolean
}

/**
 * Report period (Figma Interface · X18 Reports — Date range picker): presets on the left, a
 * month to click a start and an end, the two dates, "Compare to previous period", Apply.
 */
export function DateRangePicker({
  value,
  compare,
  onApply,
  today,
  defaultOpen,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const [draft, setDraft] = useState<{ start: string; end?: string }>(value)
  const [cmp, setCmp] = useState(compare)
  const preset = draft.end ? matchPreset(draft as DateRange, today) : undefined

  const reset = () => {
    setDraft(value)
    setCmp(compare)
  }
  // first click starts a new range, second click ends it (in either order)
  const pick = (d: string) =>
    setDraft((r) =>
      !r.start || r.end
        ? { start: d }
        : d < r.start
          ? { start: d, end: r.start }
          : { start: r.start, end: d },
    )
  const apply = () => {
    if (!draft.end) return
    onApply({ range: draft as DateRange, compare: cmp })
    setOpen(false)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) reset()
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="secondary" leadingIcon="calendar">
          {formatRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex w-auto flex-row p-0">
        <div role="menu" aria-label="Presets" className="flex w-40 flex-col border-r p-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="menuitemradio"
              aria-checked={preset === p.id}
              onClick={() => setDraft(presetRange(p.id, today))}
              className={cn(menuItem, 'text-left', preset === p.id && 'bg-accent')}
            >
              {p.label}
            </button>
          ))}
          <span
            role="menuitemradio"
            aria-checked={!preset}
            aria-disabled
            className={cn(menuItem, 'pointer-events-none text-left', !preset && 'bg-accent')}
          >
            Custom
          </span>
        </div>
        <div className="flex w-80 flex-col gap-3 p-3">
          <Calendar range={draft} onChange={pick} max={today} today={today} />
          <div className="grid grid-cols-2 gap-2">
            {(['start', 'end'] as const).map((k) => (
              <div
                key={k}
                aria-label={k === 'start' ? 'Start date' : 'End date'}
                className={cn(
                  'flex h-9 items-center gap-2 rounded-md border px-2.5 text-small',
                  draft[k] ? 'text-foreground' : 'text-muted-foreground',
                  k === 'end' && !draft.end && 'border-primary',
                )}
              >
                <Icon name="calendar" size={14} className="text-muted-foreground" />
                {draft[k] ? formatDay(draft[k]!) : 'Pick an end date'}
              </div>
            ))}
          </div>
          <Switch
            size="sm"
            checked={cmp}
            onCheckedChange={setCmp}
            label="Compare to previous period"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" disabled={!draft.end} onClick={apply}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
