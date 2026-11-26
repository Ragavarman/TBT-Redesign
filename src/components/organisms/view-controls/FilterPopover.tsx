import { useState, type ReactElement, type ReactNode } from 'react'
import { Button, Icon, IconButton, type IconName } from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Select,
} from '@/components/molecules'
import { menuItem, menuLabel, menuSeparator } from '@/components/ui/menu-styles'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface FilterFieldOption {
  id: string
  label: string
  icon: IconName
  ops: { value: string; label: string }[]
  options: { value: string; label: string }[]
}

export interface FilterRow {
  id: string
  field: string
  op: string
  values: string[]
}

export interface FilterPopoverProps {
  fields: FilterFieldOption[]
  conditions: FilterRow[]
  onAdd: (field: string) => void
  onChange: (id: string, patch: Partial<Omit<FilterRow, 'id'>>) => void
  onRemove: (id: string) => void
  onClear: () => void
  /** "41 tickets match". */
  matchLabel: ReactNode
  /** Footer action; omit to hide "Save as view". */
  onSaveView?: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactElement
}

/**
 * Filter builder (Figma Interface · X3): one row per condition — field · operator · values —
 * then "Add filter" with the fields not used yet, the live match count and Save as view.
 */
export function FilterPopover({
  fields,
  conditions,
  onAdd,
  onChange,
  onRemove,
  onClear,
  matchLabel,
  onSaveView,
  open,
  onOpenChange,
  trigger,
}: FilterPopoverProps) {
  const [adding, setAdding] = useState(conditions.length === 0)
  const used = new Set(conditions.map((c) => c.field))
  const unused = fields.filter((f) => !used.has(f.id))
  const active = conditions.filter((c) => c.values.length > 0).length

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (o) setAdding(conditions.length === 0)
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-[27rem]">
        <div className="flex items-center gap-2 px-3 pt-3 pb-2">
          <h2 className="text-title text-popover-foreground">Filters</h2>
          {active > 0 && <span className="text-small text-muted-foreground">{active} active</span>}
          <span className="flex-1" />
          {conditions.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear all
            </Button>
          )}
        </div>

        {conditions.length > 0 && (
          <ul aria-label="Conditions" className="flex flex-col gap-2 px-3 pb-2">
            {conditions.map((c) => {
              const def = fields.find((f) => f.id === c.field)!
              const picked = def.options.filter((o) => c.values.includes(o.value))
              return (
                <li
                  key={c.id}
                  className="grid grid-cols-[7rem_7rem_minmax(0,1fr)_auto] items-center gap-1.5"
                >
                  <Select
                    size="sm"
                    aria-label="Field"
                    value={c.field}
                    onValueChange={(field) => {
                      const next = fields.find((f) => f.id === field)!
                      onChange(c.id, { field, op: next.ops[0]!.value, values: [] })
                    }}
                    options={fields
                      .filter((f) => f.id === c.field || !used.has(f.id))
                      .map((f) => ({ value: f.id, label: f.label }))}
                  />
                  <Select
                    size="sm"
                    aria-label="Operator"
                    value={c.op}
                    onValueChange={(op) => onChange(c.id, { op })}
                    options={def.ops}
                    disabled={def.ops.length < 2}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        aria-label={`${def.label} values`}
                        className={cn(
                          'flex h-8 min-w-0 items-center gap-1.5 rounded-sm border bg-card px-2.5 text-left text-small outline-none',
                          'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-accent',
                        )}
                      >
                        <span
                          className={cn(
                            'min-w-0 flex-1 truncate',
                            picked.length ? 'text-foreground' : 'text-muted-foreground',
                          )}
                        >
                          {picked.length ? picked.map((p) => p.label).join(', ') : 'Choose…'}
                        </span>
                        <Icon name="chevron-down" size={14} className="text-muted-foreground" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      {def.options.map((o) => (
                        <DropdownMenuCheckboxItem
                          key={o.value}
                          checked={c.values.includes(o.value)}
                          // keep the menu open to tick several
                          onSelect={(e) => e.preventDefault()}
                          onCheckedChange={(on) =>
                            onChange(c.id, {
                              values: on
                                ? [...c.values, o.value]
                                : c.values.filter((v) => v !== o.value),
                            })
                          }
                        >
                          {o.label}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <IconButton
                    icon="x"
                    label={`Remove ${def.label} filter`}
                    size="sm"
                    onClick={() => onRemove(c.id)}
                  />
                </li>
              )
            })}
          </ul>
        )}

        {unused.length > 0 && (
          <div className="px-1 pb-1">
            {!adding ? (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className={cn(menuItem, 'text-muted-foreground')}
              >
                <Icon name="plus" size={14} />
                <span>Add filter</span>
              </button>
            ) : (
              <>
                {conditions.length > 0 && <div role="separator" className={menuSeparator} />}
                <div className={menuLabel}>Add a filter</div>
                <div role="menu" aria-label="Add a filter">
                  {unused.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onAdd(f.id)
                        setAdding(false)
                      }}
                      className={cn(menuItem, 'text-left')}
                    >
                      <Icon name={f.icon} size={14} />
                      <span className="flex-1">{f.label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 border-t px-3 py-2">
          <span className="flex-1 text-small text-muted-foreground" aria-live="polite">
            {matchLabel}
          </span>
          {onSaveView && (
            <Button variant="secondary" size="sm" disabled={active === 0} onClick={onSaveView}>
              Save as view
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
