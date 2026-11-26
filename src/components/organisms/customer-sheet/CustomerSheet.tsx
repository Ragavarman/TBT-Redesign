import { useState } from 'react'
import { Badge, Button, Input, Textarea } from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  FormField,
  Select,
} from '@/components/molecules'
import { ConfirmationModal } from '../confirmation-modal'
import { Sheet, SheetClose } from '../sheet'

export interface CustomerFormValues {
  firstName: string
  lastName: string
  phone: string
  email: string
  company: string
  location: string
  tags: string[]
  notes: string
}

export interface CustomerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** add — empty form, "Add customer" · edit — prefilled, Delete available. */
  mode: 'add' | 'edit'
  initial?: Partial<CustomerFormValues>
  companies: string[]
  locations: string[]
  /** Every tag that can be added. */
  tags: string[]
  onSave: (values: CustomerFormValues) => void
  /** Edit only. Asks first. */
  onDelete?: () => void
}

const EMPTY: CustomerFormValues = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  company: '',
  location: '',
  tags: [],
  notes: '',
}

const NONE = '__none'
const emailOk = (e: string) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

/**
 * Add or edit a customer (Figma Interface · C3): name, phone (used to match calls), email,
 * company and location, tags, and notes for agents — in a side sheet.
 */
export function CustomerSheet({
  open,
  onOpenChange,
  mode,
  initial,
  companies,
  locations,
  tags,
  onSave,
  onDelete,
}: CustomerSheetProps) {
  const [v, setV] = useState<CustomerFormValues>({ ...EMPTY, ...initial })
  const [tried, setTried] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const set = (patch: Partial<CustomerFormValues>) => setV((x) => ({ ...x, ...patch }))

  const errors = {
    firstName: !v.firstName.trim() ? 'Enter a first name' : undefined,
    email: !emailOk(v.email.trim()) ? 'Enter a valid email, like name@example.com' : undefined,
    contact: !v.phone.trim() && !v.email.trim() ? 'Add a phone number or an email' : undefined,
  }
  const valid = !errors.firstName && !errors.email && !errors.contact

  const save = () => {
    setTried(true)
    if (!valid) return
    onSave({
      ...v,
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      phone: v.phone.trim(),
      email: v.email.trim(),
      notes: v.notes.trim(),
    })
    onOpenChange(false)
  }

  const fullName = [initial?.firstName, initial?.lastName].filter(Boolean).join(' ')

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={mode === 'add' ? 'Add customer' : 'Edit customer'}
        description={
          mode === 'edit' ? fullName : 'They’ll be matched to calls and emails by phone and email.'
        }
        footer={
          <>
            {mode === 'edit' && onDelete && (
              <Button
                variant="ghost"
                className="me-auto text-destructive"
                onClick={() => setConfirming(true)}
              >
                Delete customer
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="secondary">Cancel</Button>
            </SheetClose>
            <Button onClick={save}>{mode === 'add' ? 'Add customer' : 'Save changes'}</Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
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
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First name" required error={tried ? errors.firstName : undefined}>
              <Input
                value={v.firstName}
                onChange={(e) => set({ firstName: e.target.value })}
                autoFocus
              />
            </FormField>
            <FormField label="Last name">
              <Input value={v.lastName} onChange={(e) => set({ lastName: e.target.value })} />
            </FormField>
          </div>
          <FormField
            label="Phone"
            helper="Used to match calls from RingCentral and Zendesk"
            error={tried ? errors.contact : undefined}
          >
            <Input
              type="tel"
              leadingIcon="chat"
              value={v.phone}
              onChange={(e) => set({ phone: e.target.value })}
            />
          </FormField>
          <FormField label="Email" error={tried ? errors.email : undefined}>
            <Input
              type="email"
              leadingIcon="mail"
              value={v.email}
              onChange={(e) => set({ email: e.target.value })}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Company">
              <Select
                value={v.company || NONE}
                onValueChange={(c) => set({ company: c === NONE ? '' : c })}
                options={[
                  { value: NONE, label: 'No company' },
                  ...companies.map((c) => ({ value: c, label: c })),
                ]}
              />
            </FormField>
            <FormField label="Location">
              <Select
                value={v.location || NONE}
                onValueChange={(l) => set({ location: l === NONE ? '' : l })}
                options={[
                  { value: NONE, label: 'Not set' },
                  ...locations.map((l) => ({ value: l, label: l })),
                ]}
              />
            </FormField>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-label text-foreground">Tags</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {v.tags.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  onRemove={() => set({ tags: v.tags.filter((x) => x !== t) })}
                  removeLabel={`Remove ${t}`}
                >
                  {t}
                </Badge>
              ))}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" leadingIcon="plus">
                    {v.tags.length ? 'Add' : 'Add tag'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {tags.map((t) => (
                    <DropdownMenuCheckboxItem
                      key={t}
                      checked={v.tags.includes(t)}
                      onSelect={(e) => e.preventDefault()}
                      onCheckedChange={(on) =>
                        set({ tags: on ? [...v.tags, t] : v.tags.filter((x) => x !== t) })
                      }
                    >
                      {t}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <FormField label="Notes for agents" optional>
            <Textarea rows={3} value={v.notes} onChange={(e) => set({ notes: e.target.value })} />
          </FormField>
        </form>
      </Sheet>
      {onDelete && (
        <ConfirmationModal
          open={confirming}
          onOpenChange={setConfirming}
          variant="destructive"
          title={`Delete ${fullName || 'this customer'}?`}
          description="Their tickets stay, but they’ll no longer be linked to a customer. This can’t be undone."
          confirmLabel="Delete customer"
          onConfirm={() => {
            onDelete()
            onOpenChange(false)
          }}
        />
      )}
    </>
  )
}
