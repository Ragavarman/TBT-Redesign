import { useId, useState } from 'react'
import { Badge, Button, Input, Switch, Textarea } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { cn } from '@/lib/utils'
import { ConfirmationModal } from '../confirmation-modal'
import { Dialog, DialogClose } from '../dialog'

export type TagStyleOption = 'outline' | 'filled' | 'dot'

export interface TagFormValues {
  name: string
  description: string
  style: TagStyleOption
  showOnTickets: boolean
  auto: boolean
}

export interface TagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** add — new tag · edit — existing, Delete available. */
  mode: 'add' | 'edit'
  initial?: Partial<TagFormValues>
  /** How many customers carry it (edit). */
  usage?: number
  /** Describes what "Add automatically" does, e.g. "Tag callers with 3+ calls in 30 days". */
  autoRule?: string
  /** Names already taken (for the duplicate-name check). */
  takenNames: string[]
  onSave: (v: TagFormValues) => void
  onDelete?: () => void
}

const STYLES: { value: TagStyleOption; label: string }[] = [
  { value: 'outline', label: 'Outline' },
  { value: 'filled', label: 'Filled' },
  { value: 'dot', label: 'Dot' },
]

/** How a tag looks in each style — shared by the dialog preview and the tags list. */
export function TagPreview({ name, style }: { name: string; style: TagStyleOption }) {
  return (
    <Badge variant={style === 'filled' ? 'neutral' : 'outline'} dot={style === 'dot'}>
      {name || 'Tag'}
    </Badge>
  )
}

/**
 * Create or edit a customer tag (Figma Interface · C5 Edit tag): name, description, style,
 * whether agents see it on tickets, and automatic tagging. Changes apply everywhere it's shown.
 */
export function TagDialog({
  open,
  onOpenChange,
  mode,
  initial,
  usage = 0,
  autoRule,
  takenNames,
  onSave,
  onDelete,
}: TagDialogProps) {
  const group = useId()
  const [v, setV] = useState<TagFormValues>({
    name: '',
    description: '',
    style: 'outline',
    showOnTickets: true,
    auto: false,
    ...initial,
  })
  const [tried, setTried] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const set = (patch: Partial<TagFormValues>) => setV((x) => ({ ...x, ...patch }))

  const name = v.name.trim()
  const taken = takenNames.some(
    (t) => t.toLowerCase() === name.toLowerCase() && t !== initial?.name,
  )
  const error = !name
    ? 'Give the tag a name'
    : taken
      ? 'A tag with this name already exists'
      : undefined

  const save = () => {
    setTried(true)
    if (error) return
    onSave({ ...v, name, description: v.description.trim() })
    onOpenChange(false)
  }

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        title={mode === 'add' ? 'New tag' : 'Edit tag'}
        description={
          mode === 'edit'
            ? `Used by ${usage} ${usage === 1 ? 'customer' : 'customers'}. Changes apply everywhere the tag is shown.`
            : 'Tags group customers so agents can spot them at a glance.'
        }
        footer={
          <>
            {mode === 'edit' && onDelete && (
              <Button
                variant="ghost"
                className="me-auto text-destructive"
                onClick={() => setConfirming(true)}
              >
                Delete tag
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={save}>{mode === 'add' ? 'Create tag' : 'Save'}</Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            save()
          }}
        >
          <FormField label="Name" required error={tried ? error : undefined}>
            <Input value={v.name} onChange={(e) => set({ name: e.target.value })} autoFocus />
          </FormField>
          <FormField label="Description" optional>
            <Textarea
              rows={2}
              value={v.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </FormField>
          <fieldset className="flex flex-col gap-2">
            <legend className="pb-2 text-label text-foreground">Style</legend>
            <div role="radiogroup" className="flex flex-wrap gap-2">
              {STYLES.map((s) => (
                <label
                  key={s.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-small',
                    'transition-colors duration-150 hover:bg-accent',
                    'has-checked:border-primary has-checked:bg-primary/5',
                    'has-focus-visible:ring-2 has-focus-visible:ring-ring',
                  )}
                >
                  <input
                    type="radio"
                    name={group}
                    value={s.value}
                    checked={v.style === s.value}
                    onChange={() => set({ style: s.value })}
                    className="size-4 accent-primary"
                  />
                  {s.label}
                </label>
              ))}
              <span className="ms-auto flex items-center gap-2 text-small text-muted-foreground">
                Preview <TagPreview name={name} style={v.style} />
              </span>
            </div>
          </fieldset>
          <div className="flex flex-col gap-3 border-t pt-4">
            <Switch
              checked={v.showOnTickets}
              onCheckedChange={(showOnTickets) => set({ showOnTickets })}
              label="Show on tickets"
              description="Agents see the tag in the customer card"
            />
            <Switch
              checked={v.auto}
              onCheckedChange={(auto) => set({ auto })}
              label="Add automatically"
              description={
                autoRule ?? 'Tag customers that match a rule (set up in Settings › Auto-routing)'
              }
            />
          </div>
        </form>
      </Dialog>
      {onDelete && (
        <ConfirmationModal
          open={confirming}
          onOpenChange={setConfirming}
          variant="destructive"
          title={`Delete “${initial?.name ?? 'tag'}”?`}
          description={`It comes off ${usage} ${usage === 1 ? 'customer' : 'customers'}. This can’t be undone.`}
          confirmLabel="Delete tag"
          onConfirm={() => {
            onDelete()
            onOpenChange(false)
          }}
        />
      )}
    </>
  )
}
