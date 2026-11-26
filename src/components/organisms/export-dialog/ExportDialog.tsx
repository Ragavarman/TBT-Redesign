import { useState } from 'react'
import { Button, Input, Radio, RadioGroup, Switch } from '@/components/atoms'
import { FormField, Select } from '@/components/molecules'
import { Dialog, DialogClose } from '../dialog'

export type ExportFormat = 'pdf' | 'csv' | 'png'

export interface ExportSchedule {
  every: string
  at: string
  to: string[]
}

export interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "Overview · Nov 11 – 18, 2026". */
  subject: string
  defaultRecipients?: string[]
  onDownload: (format: ExportFormat) => void
  onSchedule: (format: ExportFormat, schedule: ExportSchedule) => void
}

const FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV (raw data)' },
  { value: 'png', label: 'PNG (charts)' },
]
const DAYS = [
  'Every day',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'First of the month',
]
const TIMES = ['7:00 AM', '8:00 AM', '9:00 AM', '12:00 PM', '5:00 PM']
const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

/**
 * Export a report now, or email it on a schedule (Figma Interface · X19 Reports — Export &
 * schedule): format, schedule switch, day and time, recipients.
 */
export function ExportDialog({
  open,
  onOpenChange,
  subject,
  defaultRecipients = [],
  onDownload,
  onSchedule,
}: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf')
  const [scheduled, setScheduled] = useState(false)
  const [every, setEvery] = useState('Monday')
  const [at, setAt] = useState('8:00 AM')
  const [to, setTo] = useState(defaultRecipients.join(', '))
  const [tried, setTried] = useState(false)

  const recipients = to
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const bad = recipients.filter((r) => !emailOk(r))
  const error = !recipients.length
    ? 'Add at least one email address'
    : bad.length
      ? `Check ${bad.join(', ')}`
      : undefined

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title="Export report"
      description={subject}
      footer={
        <>
          <Button
            variant="ghost"
            className="me-auto"
            onClick={() => {
              onDownload(format)
              onOpenChange(false)
            }}
          >
            Download now
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!scheduled}
            onClick={() => {
              setTried(true)
              if (error) return
              onSchedule(format, { every, at, to: recipients })
              onOpenChange(false)
            }}
          >
            Save schedule
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <fieldset className="flex flex-col gap-2">
          <legend className="pb-2 text-label text-foreground">Format</legend>
          <RadioGroup
            value={format}
            onValueChange={(v) => setFormat(v as ExportFormat)}
            className="flex flex-wrap gap-4"
          >
            {FORMATS.map((f) => (
              <Radio key={f.value} value={f.value} label={f.label} />
            ))}
          </RadioGroup>
        </fieldset>
        <Switch
          checked={scheduled}
          onCheckedChange={setScheduled}
          label="Email this report on a schedule"
          description={`Sends the ${format.toUpperCase()} automatically`}
        />
        {scheduled && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Every">
                <Select
                  value={every}
                  onValueChange={setEvery}
                  options={DAYS.map((d) => ({ value: d, label: d }))}
                />
              </FormField>
              <FormField label="At">
                <Select
                  value={at}
                  onValueChange={setAt}
                  options={TIMES.map((t) => ({ value: t, label: t }))}
                />
              </FormField>
            </div>
            <FormField
              label="Send to"
              helper="Separate addresses with commas"
              error={tried ? error : undefined}
            >
              <Input value={to} onChange={(e) => setTo(e.target.value)} />
            </FormField>
          </>
        )}
      </div>
    </Dialog>
  )
}
