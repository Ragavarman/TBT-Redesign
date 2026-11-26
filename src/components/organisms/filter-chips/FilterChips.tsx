import type { ComponentProps, ReactNode } from 'react'
import { ToggleGroup } from 'radix-ui'
import { CONTROL } from '@/lib/optical'
import { cn } from '@/lib/utils'

export interface FilterChipOption<V extends string = string> {
  value: V
  label: ReactNode
  /** Optional count after the label. */
  count?: ReactNode
}

export interface FilterChipsProps<V extends string = string> extends Omit<
  ComponentProps<'div'>,
  'defaultValue' | 'onChange' | 'dir'
> {
  options: FilterChipOption<V>[]
  value: V
  onValueChange: (value: V) => void
  /** Accessible name of the group, e.g. "Filter timeline". */
  label: string
}

/**
 * Single-select pill filters (Figma Interface · Timeline filter): Label text, 28px, fully
 * rounded. The selected chip is primary-filled; one chip is always selected.
 */
export function FilterChips<V extends string = string>({
  options,
  value,
  onValueChange,
  label,
  className,
  ...props
}: FilterChipsProps<V>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      // Radix sends "" when the active chip is clicked again; keep the current filter instead.
      onValueChange={(v) => v && onValueChange(v as V)}
      aria-label={label}
      data-slot="filter-chips"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    >
      {options.map((o) => (
        <ToggleGroup.Item
          key={o.value}
          value={o.value}
          className={cn(
            'optical-edges inline-flex shrink-0 items-center rounded-full border optical [--bw:1px]',
            CONTROL.sm,
            'text-muted-foreground transition-colors duration-150 outline-none',
            'hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
            'data-[state=on]:border-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground',
          )}
        >
          <span>{o.label}</span>
          {o.count !== undefined && <span className="tabular-nums opacity-70">{o.count}</span>}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup.Root>
  )
}
