import { useState, type ReactElement } from 'react'
import { Button, Icon, type IconName } from '@/components/atoms'
import { addDays, Calendar, Select } from '@/components/molecules'
import { at, HOURS, hourLabel } from './snooze'
import { menuItem, menuLabel, menuSeparator, menuShortcut } from '@/components/ui/menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/** Until when a ticket sleeps: a moment, or until the customer writes back. */
export type SnoozeUntil = { at: string } | { reply: true }

export interface SnoozeMenuProps {
  /** "Now" for the presets (ISO). Times are worked out in UTC, like the rest of the workspace. */
  now: string
  onSnooze: (until: SnoozeUntil) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Usually the header's Snooze button. */
  trigger: ReactElement
}

/**
 * Snooze a ticket (Figma Interface · X5 Snooze): quick presets, or a day on the calendar plus
 * a time. The ticket comes back to the inbox at that moment.
 */
export function SnoozeMenu({ now, onSnooze, open, onOpenChange, trigger }: SnoozeMenuProps) {
  const today = now.slice(0, 10)
  const tomorrow = addDays(today, 1)
  const weekday = (new Date(now).getUTCDay() + 6) % 7 // Mon = 0
  const nextMonday = addDays(today, 7 - weekday)
  const hourNow = new Date(now).getUTCHours()

  const [day, setDay] = useState(tomorrow)
  const [hour, setHour] = useState('9')

  const presets: {
    id: string
    icon: IconName
    label: string
    meta?: string
    until: SnoozeUntil
  }[] = [
    ...(hourNow < 18
      ? [
          {
            id: 'later',
            icon: 'clock' as const,
            label: 'Later today',
            meta: hourLabel(18),
            until: { at: at(today, 18) },
          },
        ]
      : []),
    {
      id: 'tomorrow',
      icon: 'clock',
      label: 'Tomorrow',
      meta: hourLabel(9),
      until: { at: at(tomorrow, 9) },
    },
    {
      id: 'week',
      icon: 'clock',
      label: 'Next week',
      meta: `Mon ${hourLabel(9)}`,
      until: { at: at(nextMonday, 9) },
    },
    { id: 'reply', icon: 'chat', label: 'Until the customer replies', until: { reply: true } },
  ]

  const pick = (until: SnoozeUntil) => {
    onSnooze(until)
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-1">
        <div className={menuLabel}>Snooze until</div>
        <div role="menu" aria-label="Snooze presets" className="flex flex-col">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              role="menuitem"
              className={cn(menuItem, 'text-left')}
              onClick={() => pick(p.until)}
            >
              <Icon name={p.icon} size={14} />
              <span className="min-w-0 flex-1 truncate">{p.label}</span>
              {p.meta && <span className={menuShortcut}>{p.meta}</span>}
            </button>
          ))}
        </div>
        <div role="separator" className={menuSeparator} />
        <div className="flex flex-col gap-2 p-2">
          <Calendar value={day} onChange={setDay} min={today} today={today} />
          <div className="flex items-center gap-2">
            <span className="flex-1 text-small text-muted-foreground">Time</span>
            <Select
              size="sm"
              aria-label="Time"
              value={hour}
              onValueChange={setHour}
              options={HOURS.map((h) => ({ value: String(h), label: hourLabel(h) }))}
              className="w-28"
            />
            <Button
              size="sm"
              disabled={at(day, Number(hour)) <= now}
              onClick={() => pick({ at: at(day, Number(hour)) })}
            >
              Snooze
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
