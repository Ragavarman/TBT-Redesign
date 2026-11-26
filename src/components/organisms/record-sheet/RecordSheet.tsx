import { useState, type ReactNode } from 'react'
import { Badge, Button, Input, Switch, Textarea } from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  FormField,
  Select,
} from '@/components/molecules'
import { cn } from '@/lib/utils'
import { ConfirmationModal } from '../confirmation-modal'
import { Dialog, DialogClose } from '../dialog'
import { Sheet, SheetClose } from '../sheet'

export type RecordValues = Record<string, string | number | boolean | string[]>

export interface RecordField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'tags' | 'switch' | 'date'
  /** select / tags choices. */
  options?: string[]
  required?: boolean
  placeholder?: string
  /** Helper under a field, or the second line of a switch. */
  helper?: string
  /** Half width — two in a row. */
  half?: boolean
  rows?: number
  /** Extra check; return a message when the value is wrong. */
  validate?: (value: RecordValues[string], all: RecordValues) => string | undefined
}

export interface RecordSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: RecordField[]
  initial?: RecordValues
  onSave: (values: RecordValues) => void
  saveLabel?: string
  /** Edit only — shows a destructive Delete that asks first. */
  onDelete?: () => void
  deleteLabel?: string
  /** sheet (default, side panel) · dialog (centred). */
  variant?: 'sheet' | 'dialog'
  /** Extra content under a field, e.g. variable chips under a message. */
  after?: Record<string, (insert: (text: string) => void) => ReactNode>
}

function emptyFor(f: RecordField): RecordValues[string] {
  if (f.type === 'switch') return false
  if (f.type === 'tags') return []
  if (f.type === 'select') return f.options?.[0] ?? ''
  return ''
}

/**
 * A record form built from a field list (Figma Interface edit panels: canned reply, brand,
 * category, location, agent, team, SLA policy, routing rule…): required fields, validation,
 * Delete with confirmation — in a side sheet or a dialog.
 */
export function RecordSheet({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial,
  onSave,
  saveLabel = 'Save',
  onDelete,
  deleteLabel = 'Delete',
  variant = 'sheet',
  after,
}: RecordSheetProps) {
  const [v, setV] = useState<RecordValues>(() =>
    Object.fromEntries(fields.map((f) => [f.name, initial?.[f.name] ?? emptyFor(f)])),
  )
  const [tried, setTried] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const set = (name: string, value: RecordValues[string]) => setV((x) => ({ ...x, [name]: value }))

  const errorOf = (f: RecordField) => {
    const val = v[f.name]
    if (f.required && (val === '' || (Array.isArray(val) && !val.length)))
      return `Enter ${f.label.toLowerCase()}`
    if (f.type === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val)))
      return 'Enter a valid email'
    return f.validate?.(val ?? '', v)
  }
  const errors = Object.fromEntries(fields.map((f) => [f.name, errorOf(f)]))
  const valid = Object.values(errors).every((e) => !e)

  const save = () => {
    setTried(true)
    if (!valid) return
    const clean = Object.fromEntries(
      Object.entries(v).map(([k, val]) => [k, typeof val === 'string' ? val.trim() : val]),
    )
    onSave(clean)
    onOpenChange(false)
  }

  const form = (
    <form
      className="grid grid-cols-2 gap-x-3 gap-y-4"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          save()
        }
      }}
    >
      {fields.map((f, i) => {
        const error = tried ? errors[f.name] : undefined
        const val = v[f.name]
        const span = f.half ? 'col-span-1' : 'col-span-2'
        const insert = (text: string) => set(f.name, `${String(val ?? '')}${text}`)
        if (f.type === 'switch') {
          return (
            <div key={f.name} className={cn(span, 'border-t pt-4')}>
              <Switch
                checked={!!val}
                onCheckedChange={(on) => set(f.name, on)}
                label={f.label}
                description={f.helper}
              />
            </div>
          )
        }
        if (f.type === 'tags') {
          const list = (val as string[]) ?? []
          return (
            <div key={f.name} className={cn(span, 'flex flex-col gap-2')}>
              <span className="text-label text-foreground">{f.label}</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {list.map((t) => (
                  <Badge
                    key={t}
                    variant="outline"
                    onRemove={() =>
                      set(
                        f.name,
                        list.filter((x) => x !== t),
                      )
                    }
                    removeLabel={`Remove ${t}`}
                  >
                    {t}
                  </Badge>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" leadingIcon="plus">
                      Add
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {(f.options ?? []).map((o) => (
                      <DropdownMenuCheckboxItem
                        key={o}
                        checked={list.includes(o)}
                        onSelect={(e) => e.preventDefault()}
                        onCheckedChange={(on) =>
                          set(f.name, on ? [...list, o] : list.filter((x) => x !== o))
                        }
                      >
                        {o}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {error && <p className="text-small text-destructive">{error}</p>}
            </div>
          )
        }
        return (
          <div key={f.name} className={cn(span, 'flex flex-col gap-2')}>
            <FormField label={f.label} required={f.required} helper={f.helper} error={error}>
              {f.type === 'textarea' ? (
                <Textarea
                  rows={f.rows ?? 4}
                  placeholder={f.placeholder}
                  value={String(val ?? '')}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              ) : f.type === 'select' ? (
                <Select
                  value={String(val)}
                  onValueChange={(x) => set(f.name, x)}
                  options={(f.options ?? []).map((o) => ({ value: o, label: o }))}
                />
              ) : (
                <Input
                  type={f.type === 'date' ? 'text' : f.type}
                  placeholder={f.placeholder}
                  value={String(val ?? '')}
                  onChange={(e) =>
                    set(f.name, f.type === 'number' ? e.target.value : e.target.value)
                  }
                  autoFocus={i === 0}
                />
              )}
            </FormField>
            {after?.[f.name]?.(insert)}
          </div>
        )
      })}
    </form>
  )

  const footer = (
    <>
      {onDelete && (
        <Button
          variant="ghost"
          className="me-auto text-destructive"
          onClick={() => setConfirming(true)}
        >
          {deleteLabel}
        </Button>
      )}
      {variant === 'sheet' ? (
        <SheetClose asChild>
          <Button variant="secondary">Cancel</Button>
        </SheetClose>
      ) : (
        <DialogClose asChild>
          <Button variant="ghost">Cancel</Button>
        </DialogClose>
      )}
      <Button onClick={save}>{saveLabel}</Button>
    </>
  )

  return (
    <>
      {variant === 'sheet' ? (
        <Sheet
          open={open}
          onOpenChange={onOpenChange}
          title={title}
          description={description}
          footer={footer}
        >
          {form}
        </Sheet>
      ) : (
        <Dialog
          open={open}
          onOpenChange={onOpenChange}
          title={title}
          description={description}
          footer={footer}
        >
          {form}
        </Dialog>
      )}
      {onDelete && (
        <ConfirmationModal
          open={confirming}
          onOpenChange={setConfirming}
          variant="destructive"
          title={`${deleteLabel}?`}
          description="This can’t be undone."
          confirmLabel={deleteLabel}
          onConfirm={() => {
            onDelete()
            onOpenChange(false)
          }}
        />
      )}
    </>
  )
}
