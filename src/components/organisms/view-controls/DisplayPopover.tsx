import type { ReactElement } from 'react'
import { Button, Switch } from '@/components/atoms'
import { Select } from '@/components/molecules'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type Options = { value: string; label: string }[]

export interface DisplayValue {
  grouping: string
  ordering: string
  density: string
  showEmptyGroups: boolean
  /** Visible row properties. */
  props: string[]
}

export interface DisplayPopoverProps {
  value: DisplayValue
  onChange: (patch: Partial<DisplayValue>) => void
  onReset: () => void
  /** Omit a list to hide that control (e.g. no grouping on a table). */
  groupings?: Options
  orderings: Options
  densities?: Options
  /** Row properties that can be toggled ("Properties shown on rows"). */
  properties: Options
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactElement
}

function Row({ label, children }: { label: string; children: ReactElement }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex-1 text-body text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

/**
 * Display options (Figma Interface · X4): grouping, ordering, density, empty groups and which
 * properties rows show.
 */
export function DisplayPopover({
  value,
  onChange,
  onReset,
  groupings,
  orderings,
  densities,
  properties,
  open,
  onOpenChange,
  trigger,
}: DisplayPopoverProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-[21rem]">
        <div className="flex flex-col gap-2 p-3">
          {groupings && (
            <Row label="Grouping">
              <Select
                size="sm"
                aria-label="Grouping"
                value={value.grouping}
                onValueChange={(grouping) => onChange({ grouping })}
                options={groupings}
                className="w-40"
              />
            </Row>
          )}
          <Row label="Ordering">
            <Select
              size="sm"
              aria-label="Ordering"
              value={value.ordering}
              onValueChange={(ordering) => onChange({ ordering })}
              options={orderings}
              className="w-40"
            />
          </Row>
          {densities && (
            <Row label="Density">
              <Select
                size="sm"
                aria-label="Density"
                value={value.density}
                onValueChange={(density) => onChange({ density })}
                options={densities}
                className="w-40"
              />
            </Row>
          )}
        </div>
        {groupings && (
          <div className="border-t px-3 py-3">
            <Switch
              size="sm"
              checked={value.showEmptyGroups}
              onCheckedChange={(showEmptyGroups) => onChange({ showEmptyGroups })}
              disabled={value.grouping === 'none'}
              label="Show empty groups"
            />
          </div>
        )}
        <div className="flex flex-col gap-2 border-t px-3 py-3">
          <h3 className="text-small text-muted-foreground">Properties shown on rows</h3>
          <div
            role="group"
            aria-label="Properties shown on rows"
            className="flex flex-wrap gap-1.5"
          >
            {properties.map((p) => {
              const on = value.props.includes(p.value)
              return (
                <button
                  key={p.value}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    onChange({
                      props: on
                        ? value.props.filter((x) => x !== p.value)
                        : [...value.props, p.value],
                    })
                  }
                  className={cn(
                    'cursor-pointer rounded-xs border px-2 py-0.5 text-small outline-none',
                    'transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-ring',
                    on
                      ? 'border-border bg-accent text-foreground'
                      : 'border-dashed text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex justify-end border-t px-3 py-2">
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset to default
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
