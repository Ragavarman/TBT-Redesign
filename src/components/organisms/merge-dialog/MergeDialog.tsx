import { useId, useState } from 'react'
import { Button, Input, StatusGlyph, Switch } from '@/components/atoms'
import { cn } from '@/lib/utils'
import type { TicketStatus } from '@/types'
import { Dialog, DialogClose } from '../dialog'

export interface MergeCandidate {
  id: number
  /** "T-220". */
  label: string
  subject: string
  status: TicketStatus
  /** "3h", "Nov 4". */
  timeLabel: string
  /** Customer name, matched by the search. */
  customer: string
  /** Listed under "Suggested — same caller" before searching. */
  suggested?: boolean
}

export interface MergeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The ticket being merged away, e.g. "T-222". */
  ticketLabel: string
  candidates: MergeCandidate[]
  onMerge: (r: { targetId: number; notify: boolean }) => void
}

/**
 * Merge a ticket into another (Figma Interface · T4 Merge tickets): search or pick a suggested
 * ticket from the same caller, optionally tell the caller, then merge. The merged ticket closes.
 */
export function MergeDialog({
  open,
  onOpenChange,
  ticketLabel,
  candidates,
  onMerge,
}: MergeDialogProps) {
  const name = useId()
  const [query, setQuery] = useState('')
  const [notify, setNotify] = useState(false)
  const suggested = candidates.filter((c) => c.suggested)
  const [target, setTarget] = useState<number | undefined>(suggested[0]?.id)

  const q = query.trim().toLowerCase()
  const shown = q
    ? candidates.filter((c) => `${c.label} ${c.subject} ${c.customer}`.toLowerCase().includes(q))
    : suggested
  const picked = candidates.find((c) => c.id === target)

  const merge = () => {
    if (!picked) return
    onMerge({ targetId: picked.id, notify })
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={`Merge ${ticketLabel} into another ticket`}
      description={`Messages, notes and attachments move to the ticket you pick. ${ticketLabel} is then closed and linked.`}
      footer={
        <>
          <span className="me-auto text-small text-muted-foreground" aria-live="polite">
            {picked ? `Merges into ${picked.label}` : 'Pick a ticket to merge into'}
          </span>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button disabled={!picked} onClick={merge}>
            Merge ticket
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          type="search"
          leadingIcon="search"
          aria-label="Search tickets"
          placeholder="Search by ID, subject or caller"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onClear={query ? () => setQuery('') : undefined}
          autoFocus
        />
        <div className="flex flex-col gap-2">
          <h3 className="text-small text-muted-foreground">
            {q
              ? `${shown.length} ${shown.length === 1 ? 'match' : 'matches'}`
              : 'Suggested — same caller'}
          </h3>
          {shown.length === 0 ? (
            <p className="rounded-lg border px-3 py-4 text-center text-small text-muted-foreground">
              {q ? 'No tickets match' : 'No other tickets from this caller'}
            </p>
          ) : (
            <div
              role="radiogroup"
              aria-label="Merge into"
              className="overflow-hidden rounded-lg border"
            >
              {shown.map((c) => (
                <label
                  key={c.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 border-b px-3 py-2.5 last:border-b-0',
                    'transition-colors duration-150 hover:bg-accent has-checked:bg-muted',
                    'has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-inset',
                  )}
                >
                  <input
                    type="radio"
                    name={name}
                    value={c.id}
                    checked={c.id === target}
                    onChange={() => setTarget(c.id)}
                    className="size-4 shrink-0 accent-primary"
                  />
                  <StatusGlyph status={c.status} />
                  <span className="w-12 shrink-0 text-small text-muted-foreground tabular-nums">
                    {c.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-body text-foreground">
                    {c.subject}
                  </span>
                  <span className="shrink-0 text-small text-muted-foreground">{c.timeLabel}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <Switch
          checked={notify}
          onCheckedChange={setNotify}
          label="Notify the caller"
          description="Send a short note that the tickets were combined"
        />
      </div>
    </Dialog>
  )
}
