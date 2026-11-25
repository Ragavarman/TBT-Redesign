import { useState } from 'react'
import { Badge, Button, Input, Radio, RadioGroup, Switch } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { Dialog, DialogClose } from '../dialog'

export interface SaveViewSubmit {
  name: string
  visibility: string
  favorite: boolean
}

export interface SaveViewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultName?: string
  /** "Status is Open, Investigating" — one chip each. */
  filterSummary: string[]
  /** Who can see it, in order; the first is preselected unless `defaultVisibility` says otherwise. */
  visibilities: { value: string; label: string; description: string }[]
  defaultVisibility?: string
  onSave: (v: SaveViewSubmit) => void
}

/**
 * Save the current filters as a view (Figma Interface · T6 Save view): name, the filters it
 * keeps, who can see it, and whether it goes in Favorites.
 */
export function SaveViewDialog({
  open,
  onOpenChange,
  defaultName = '',
  filterSummary,
  visibilities,
  defaultVisibility,
  onSave,
}: SaveViewDialogProps) {
  const [name, setName] = useState(defaultName)
  const [visibility, setVisibility] = useState(defaultVisibility ?? visibilities[0]?.value ?? '')
  const [favorite, setFavorite] = useState(true)
  const valid = name.trim().length > 0

  const save = () => {
    if (!valid) return
    onSave({ name: name.trim(), visibility, favorite })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Save view"
      description="Save the current filters so you can open this list in one click."
      footer={
        <>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button disabled={!valid} onClick={save}>
            Save view
          </Button>
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
        <FormField label="Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </FormField>
        <div className="flex flex-col gap-2">
          <h3 className="text-label text-foreground">Filters in this view</h3>
          <ul className="flex flex-wrap gap-1.5">
            {filterSummary.map((f) => (
              <li key={f}>
                <Badge variant="outline">{f}</Badge>
              </li>
            ))}
          </ul>
        </div>
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-2 text-label text-foreground">Who can see it</legend>
          <RadioGroup value={visibility} onValueChange={setVisibility} className="gap-3">
            {visibilities.map((v) => (
              <Radio key={v.value} value={v.value} label={v.label} description={v.description} />
            ))}
          </RadioGroup>
        </fieldset>
        <Switch checked={favorite} onCheckedChange={setFavorite} label="Add to favorites" />
      </form>
    </Dialog>
  )
}
