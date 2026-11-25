import { useId, useRef, useState, type DragEvent } from 'react'
import { Button, Icon, IconButton, Input, Textarea } from '@/components/atoms'
import { Calendar, FormField, Select } from '@/components/molecules'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/types'
import { Sheet, SheetClose } from '../sheet'

export interface InvoiceSubmit {
  number: string
  /** "YYYY-MM-DD". */
  date: string
  amount: number
  currency: string
  status: string
  file?: { name: string; size: number }
  notes: string
}

export interface InvoiceSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "Linked to T-222 · Dennis D.". */
  linkedTo: string
  /** Read-only customer line, e.g. "Dennis D. · (909) 802-3652". */
  customer: string
  defaultNumber?: string
  /** Default date, "YYYY-MM-DD". */
  today: string
  currencies?: string[]
  statuses?: string[]
  onAdd: (invoice: InvoiceSubmit) => void
}

const MAX_BYTES = 10 * 1024 * 1024
const longDate = (d: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${d}T00:00:00Z`))

/**
 * Link an invoice to a ticket (Figma Interface · T5 Add invoice): number, date, amount and
 * currency, status, the customer, the PDF (drop or browse) and notes — in a side sheet.
 */
export function InvoiceSheet({
  open,
  onOpenChange,
  linkedTo,
  customer,
  defaultNumber = '',
  today,
  currencies = ['LKR', 'USD', 'EUR', 'GBP'],
  statuses = ['Unpaid', 'Paid', 'Overdue', 'Refunded'],
  onAdd,
}: InvoiceSheetProps) {
  const fileInput = useRef<HTMLInputElement>(null)
  const dropId = useId()
  const [number, setNumber] = useState(defaultNumber)
  const [date, setDate] = useState(today)
  const [dateOpen, setDateOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(currencies[0] ?? 'LKR')
  const [status, setStatus] = useState(statuses[0] ?? 'Unpaid')
  const [file, setFile] = useState<{ name: string; size: number }>()
  const [fileError, setFileError] = useState<string>()
  const [notes, setNotes] = useState('')
  const [dragging, setDragging] = useState(false)
  const [tried, setTried] = useState(false)

  const value = Number(amount.replace(/,/g, ''))
  const amountOk = amount.trim() !== '' && Number.isFinite(value) && value > 0
  const numberOk = number.trim() !== ''

  const take = (f: File | undefined) => {
    if (!f) return
    if (f.type && f.type !== 'application/pdf') return setFileError('Choose a PDF file')
    if (f.size > MAX_BYTES) return setFileError('PDF is larger than 10 MB')
    setFileError(undefined)
    setFile({ name: f.name, size: f.size })
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    take(e.dataTransfer.files[0])
  }

  const submit = () => {
    setTried(true)
    if (!numberOk || !amountOk) return
    onAdd({
      number: number.trim(),
      date,
      amount: value,
      currency,
      status,
      file,
      notes: notes.trim(),
    })
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add invoice"
      description={linkedTo}
      footer={
        <>
          <SheetClose asChild>
            <Button variant="secondary">Cancel</Button>
          </SheetClose>
          <Button onClick={submit}>Add invoice</Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField
            label="Invoice number"
            required
            error={tried && !numberOk ? 'Enter the invoice number' : undefined}
          >
            <Input value={number} onChange={(e) => setNumber(e.target.value)} autoFocus />
          </FormField>
          <FormField label="Date">
            <Popover open={dateOpen} onOpenChange={setDateOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex h-9 w-full items-center gap-2 rounded-md border bg-card px-3 text-left text-body text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-accent"
                >
                  <Icon name="calendar" size={14} className="text-muted-foreground" />
                  {longDate(date)}
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-72 p-2">
                <Calendar
                  value={date}
                  today={today}
                  onChange={(d) => {
                    setDate(d)
                    setDateOpen(false)
                  }}
                  className="border-0"
                />
              </PopoverContent>
            </Popover>
          </FormField>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_8rem] gap-3">
          <FormField
            label="Amount"
            required
            error={tried && !amountOk ? 'Enter an amount above 0' : undefined}
          >
            <Input
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() =>
                amountOk &&
                setAmount(
                  value.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                )
              }
            />
          </FormField>
          <FormField label="Currency">
            <Select
              value={currency}
              onValueChange={setCurrency}
              options={currencies.map((c) => ({ value: c, label: c }))}
            />
          </FormField>
        </div>
        <FormField label="Status">
          <Select
            value={status}
            onValueChange={setStatus}
            options={statuses.map((s) => ({ value: s, label: s }))}
          />
        </FormField>
        <FormField label="Customer">
          <Input value={customer} readOnly leadingIcon="user" />
        </FormField>

        {file ? (
          <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
            <Icon name="paperclip" size={16} className="text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-body text-foreground">{file.name}</span>
            <span className="shrink-0 text-small text-muted-foreground">
              {formatBytes(file.size)}
            </span>
            <IconButton
              icon="x"
              label={`Remove ${file.name}`}
              size="sm"
              onClick={() => setFile(undefined)}
            />
          </div>
        ) : (
          <div>
            <label
              htmlFor={dropId}
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={cn(
                'flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-6 text-center',
                'transition-colors duration-150 hover:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring',
                dragging && 'border-primary bg-primary/5',
              )}
            >
              <Icon name="paperclip" size={16} className="text-muted-foreground" />
              <span className="text-body text-foreground">
                Drop the invoice PDF here or <span className="text-primary">browse</span>
              </span>
              <span className="text-small text-muted-foreground">PDF up to 10 MB</span>
              <input
                ref={fileInput}
                id={dropId}
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={(e) => {
                  take(e.target.files?.[0])
                  e.target.value = ''
                }}
              />
            </label>
            {fileError && (
              <p role="alert" className="pt-1.5 text-small text-destructive">
                {fileError}
              </p>
            )}
          </div>
        )}

        <FormField label="Notes" optional>
          <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>
      </form>
    </Sheet>
  )
}
