import {
  Fragment,
  useId,
  useMemo,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Icon } from '@/components/atoms'
import { menuItem, menuLabel, menuSeparator, menuShortcut } from '@/components/ui/menu-styles'
import { cn } from '@/lib/utils'

export interface PickerOption {
  value: string
  label: string
  /** 14–16px glyph, icon or xs avatar before the label. */
  icon?: ReactNode
  /** Trailing text, e.g. "online", "8 open". */
  meta?: ReactNode
  /** Trailing shortcut hint, e.g. "1" or "A". */
  hint?: ReactNode
  /** Current value — shows a check. */
  selected?: boolean
  /** Options with the same group are listed under that heading. */
  group?: string
  /** Extra words the search matches (e.g. the status id "open"). */
  keywords?: string
}

export interface PickerListProps extends Omit<ComponentProps<'div'>, 'onSelect'> {
  options: PickerOption[]
  onSelect: (value: string) => void
  /** Search placeholder, e.g. "Change status…". */
  placeholder: string
  /** Accessible name of the list, e.g. "Statuses". */
  label: string
  /** Press 1–9 (with an empty search) to pick the option at that position. */
  numberKeys?: boolean
  /** Muted strip under the list, e.g. a shortcut tip. */
  footer?: ReactNode
  /** Shown when the search matches nothing. */
  emptyText?: string
}

/**
 * Searchable option list for pickers (Figma Interface · X1 Status picker, X2 Assignee picker):
 * a search field over grouped options. ↑ ↓ move, Enter picks, typing filters.
 * Combobox pattern: focus stays in the search field; the active option is announced via
 * aria-activedescendant.
 */
export function PickerList({
  options,
  onSelect,
  placeholder,
  label,
  numberKeys,
  footer,
  emptyText = 'No matches',
  className,
  ...props
}: PickerListProps) {
  const id = useId()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(() =>
    Math.max(
      0,
      options.findIndex((o) => o.selected),
    ),
  )

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => `${o.label} ${o.keywords ?? ''}`.toLowerCase().includes(q))
  }, [options, query])

  const activeIndex = Math.min(active, shown.length - 1)
  const optionId = (i: number) => `${id}-opt-${i}`

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const last = shown.length - 1
    if (e.key === 'ArrowDown') setActive(activeIndex >= last ? 0 : activeIndex + 1)
    else if (e.key === 'ArrowUp') setActive(activeIndex <= 0 ? last : activeIndex - 1)
    else if (e.key === 'Home') setActive(0)
    else if (e.key === 'End') setActive(last)
    else if (e.key === 'Enter') {
      const o = shown[activeIndex]
      if (o) onSelect(o.value)
    } else if (numberKeys && !query && /^[1-9]$/.test(e.key)) {
      const o = shown[Number(e.key) - 1]
      if (o) onSelect(o.value)
    } else return
    e.preventDefault()
  }

  return (
    <div data-slot="picker-list" className={cn('flex flex-col', className)} {...props}>
      <div className="flex items-center gap-2 border-b px-3">
        <Icon name="search" size={14} className="text-muted-foreground" />
        <input
          role="combobox"
          aria-expanded
          aria-controls={`${id}-list`}
          aria-activedescendant={shown[activeIndex] ? optionId(activeIndex) : undefined}
          aria-autocomplete="list"
          aria-label={placeholder}
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setActive(0)
          }}
          onKeyDown={onKeyDown}
          className="h-10 min-w-0 flex-1 bg-transparent text-body text-popover-foreground outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div
        id={`${id}-list`}
        role="listbox"
        aria-label={label}
        className="max-h-80 overflow-y-auto p-1"
      >
        {shown.length === 0 && (
          <p className="px-2 py-3 text-center text-small text-muted-foreground">{emptyText}</p>
        )}
        {shown.map((o, i) => {
          const heading = o.group && o.group !== shown[i - 1]?.group ? o.group : undefined
          return (
            <Fragment key={o.value}>
              {heading && (
                <>
                  {i > 0 && <div role="separator" className={menuSeparator} />}
                  <div role="presentation" className={menuLabel}>
                    {heading}
                  </div>
                </>
              )}
              <div
                id={optionId(i)}
                role="option"
                aria-selected={i === activeIndex}
                aria-current={o.selected || undefined}
                data-highlighted={i === activeIndex ? '' : undefined}
                onMouseMove={() => i !== activeIndex && setActive(i)}
                // keep focus in the search field
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(o.value)}
                className={menuItem}
              >
                {o.icon}
                <span className="min-w-0 flex-1 truncate">{o.label}</span>
                {o.selected && <Icon name="check" size={14} label="Current" />}
                {o.meta && (
                  <span className="shrink-0 text-small text-muted-foreground">{o.meta}</span>
                )}
                {o.hint && <span className={cn(menuShortcut, 'pl-2')}>{o.hint}</span>}
              </div>
            </Fragment>
          )
        })}
      </div>
      {footer && (
        <div className="flex items-center gap-2 border-t px-3 py-2 text-caption text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  )
}
