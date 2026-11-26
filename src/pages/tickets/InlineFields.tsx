import { useState, type ReactNode } from 'react'
import { PickerList, type PickerOption } from '@/components/molecules'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

/** Value styling shared by every inline-editable property (hover fill, focus ring). */
const inlineTrigger =
  '-mx-1 inline-flex min-w-0 cursor-pointer items-center gap-1.5 rounded-xs px-1 py-0.5 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-accent'

export interface FieldPickerProps {
  /** Property name — "Change {label}" for screen readers. */
  label: string
  placeholder: string
  options: Omit<PickerOption, 'selected'>[]
  /** Current value; an array for multi-select (stays open while toggling). */
  value: string | string[] | undefined
  onChange: (value: string) => void
  /** The value as shown in the row — it opens the picker. */
  children: ReactNode
  className?: string
}

/** Click a property value to change it: a searchable list in a popover (like Status / Assignee). */
export function FieldPicker({
  label,
  placeholder,
  options,
  value,
  onChange,
  children,
  className,
}: FieldPickerProps) {
  const [open, setOpen] = useState(false)
  const multiple = Array.isArray(value)
  const isOn = (v: string) => (multiple ? value.includes(v) : value === v)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Change ${label.toLowerCase()}`}
          className={cn(inlineTrigger, 'flex-wrap', className)}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <PickerList
          label={label}
          placeholder={placeholder}
          options={options.map((o) => ({ ...o, selected: isOn(o.value) }))}
          onSelect={(v) => {
            onChange(v)
            if (!multiple) setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

/** Click to edit a line of text in place; Enter or blur saves, Escape cancels. */
export function InlineText({
  value,
  onChange,
  label,
  className,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  className?: string
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const commit = () => {
    const next = draft?.trim()
    if (next && next !== value) onChange(next)
    setDraft(null)
  }
  if (draft === null)
    return (
      <button
        type="button"
        aria-label={`Edit ${label.toLowerCase()}`}
        onClick={() => setDraft(value)}
        className={cn(
          '-mx-1 cursor-text rounded-xs px-1 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        {value}
      </button>
    )
  return (
    <input
      autoFocus
      aria-label={label}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit()
        else if (e.key === 'Escape') setDraft(null)
      }}
      className={cn(
        '-mx-1 w-[calc(100%+0.5rem)] rounded-xs bg-transparent px-1 ring-2 ring-ring outline-none',
        className,
      )}
    />
  )
}
