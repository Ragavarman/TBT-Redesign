import { useState } from 'react'
import { Button, Checkbox, Input } from '@/components/atoms'
import { FormField } from '@/components/molecules'
import { Dialog, DialogClose } from '../dialog'

export interface CompanyFormValues {
  name: string
  domain: string
  applications: string[]
}

export interface CompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Products a company can use. */
  applications: string[]
  /** Names already taken (case-insensitive check). */
  takenNames: string[]
  onSave: (v: CompanyFormValues) => void
}

const domainOk = (d: string) => !d || /^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(d)

/** Add a company (Figma Interface · X15 Companies → Add company): name, email domain, apps. */
export function CompanyDialog({
  open,
  onOpenChange,
  applications,
  takenNames,
  onSave,
}: CompanyDialogProps) {
  const [v, setV] = useState<CompanyFormValues>({ name: '', domain: '', applications: [] })
  const [tried, setTried] = useState(false)
  const name = v.name.trim()
  const domain = v.domain
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '')
  const errors = {
    name: !name
      ? 'Enter the company name'
      : takenNames.some((t) => t.toLowerCase() === name.toLowerCase())
        ? 'That company is already listed'
        : undefined,
    domain: !domainOk(domain) ? 'Enter a domain like acme.lk' : undefined,
  }

  const save = () => {
    setTried(true)
    if (errors.name || errors.domain) return
    onSave({ name, domain, applications: v.applications })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add company"
      description="Customers with an email at this domain are matched to it."
      size="sm"
      footer={
        <>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={save}>Add company</Button>
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
        <FormField label="Name" required error={tried ? errors.name : undefined}>
          <Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} autoFocus />
        </FormField>
        <FormField label="Domain" optional error={tried ? errors.domain : undefined}>
          <Input
            placeholder="acme.lk"
            value={v.domain}
            onChange={(e) => setV({ ...v, domain: e.target.value })}
          />
        </FormField>
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-2 text-label text-foreground">Applications</legend>
          {applications.map((a) => (
            <Checkbox
              key={a}
              label={a}
              checked={v.applications.includes(a)}
              onCheckedChange={(on) =>
                setV({
                  ...v,
                  applications: on ? [...v.applications, a] : v.applications.filter((x) => x !== a),
                })
              }
            />
          ))}
        </fieldset>
      </form>
    </Dialog>
  )
}
