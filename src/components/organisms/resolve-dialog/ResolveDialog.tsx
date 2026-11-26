import { useId, useState } from 'react'
import { Button, Kbd, Switch, Textarea } from '@/components/atoms'
import { FormField, Select } from '@/components/molecules'
import { Dialog, DialogClose } from '../dialog'

export interface ResolveSubmit {
  resolution: string
  /** Sent to the customer as the last reply. Empty = resolve quietly. */
  message: string
  survey: boolean
  linkNote: boolean
}

export interface ResolveDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "T-222". */
  ticketLabel: string
  /** First name for the closing-message label: "Closing message to Dennis". */
  customerName: string
  /** Resolution reasons; the first is preselected. */
  resolutions: string[]
  defaultMessage?: string
  /** Knowledge note the fix can be linked to; hides the switch when absent. */
  knowledgeNote?: string
  /** Days a customer reply still reopens the ticket. Default 7. */
  reopenDays?: number
  /** Shortcut that resolves without the dialog, shown in the footer. Default "E". */
  quickShortcut?: string
  onResolve: (r: ResolveSubmit) => void
}

/**
 * Resolve a ticket (Figma Interface · X8 Resolve): resolution, closing message to the customer,
 * satisfaction survey and knowledge-note link.
 */
export function ResolveDialog({
  open,
  onOpenChange,
  ticketLabel,
  customerName,
  resolutions,
  defaultMessage = '',
  knowledgeNote,
  reopenDays = 7,
  quickShortcut = 'E',
  onResolve,
}: ResolveDialogProps) {
  const id = useId()
  const [resolution, setResolution] = useState(resolutions[0] ?? '')
  const [message, setMessage] = useState(defaultMessage)
  const [survey, setSurvey] = useState(true)
  const [linkNote, setLinkNote] = useState(false)

  const submit = () => {
    onResolve({
      resolution,
      message: message.trim(),
      survey,
      linkNote: linkNote && !!knowledgeNote,
    })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Resolve ${ticketLabel}`}
      description={`The customer gets your closing message. The ticket reopens if they reply within ${reopenDays} days.`}
      footer={
        <>
          <span className="me-auto flex items-center gap-1.5 text-small text-muted-foreground">
            <Kbd>{quickShortcut}</Kbd> resolves without this dialog
          </span>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={submit}>Resolve ticket</Button>
        </>
      }
    >
      <form
        id={id}
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            submit()
          }
        }}
      >
        <FormField label="Resolution">
          <Select
            value={resolution}
            onValueChange={setResolution}
            options={resolutions.map((r) => ({ value: r, label: r }))}
          />
        </FormField>
        <FormField label={`Closing message to ${customerName}`} optional>
          <Textarea rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
        </FormField>
        <div className="flex flex-col gap-3">
          <Switch
            checked={survey}
            onCheckedChange={setSurvey}
            label="Send satisfaction survey"
            description="One-question CSAT email after closing"
          />
          {knowledgeNote && (
            <Switch
              checked={linkNote}
              onCheckedChange={setLinkNote}
              label="Link the fix to the knowledge note"
              description={knowledgeNote}
            />
          )}
        </div>
      </form>
    </Dialog>
  )
}
