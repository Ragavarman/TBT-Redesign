import { useRef, useState, type ReactNode } from 'react'
import {
  Avatar,
  Button,
  Icon,
  IconButton,
  Input,
  PriorityGlyph,
  StatusGlyph,
  Switch,
  Textarea,
  type IconName,
} from '@/components/atoms'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  FormField,
  PickerList,
  Select,
} from '@/components/molecules'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import {
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUSES,
  TICKET_STATUS_LABEL,
  type TicketChannel,
  type TicketPriority,
  type TicketStatus,
} from '@/types'
import { Dialog, DialogClose } from '../dialog'

export interface NewTicketSubmit {
  customerId: string
  channel: TicketChannel
  subject: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  assigneeId?: string
  team: string
  application?: string
  labels: string[]
  attachments: { name: string; size: number }[]
}

export interface NewTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customers: { id: string; name: string; detail?: string }[]
  agents: { id: string; name: string }[]
  /** The signed-in agent — the default assignee ("Assign to me"). */
  meId: string
  teams: string[]
  applications: string[]
  labels: string[]
  /** Pre-picked customer (e.g. from a call). */
  defaultCustomerId?: string
  /** `another` — "Create another" is on: the form resets and stays open. */
  onCreate: (ticket: NewTicketSubmit, another: boolean) => void
}

const CHANNELS: { value: TicketChannel; label: string }[] = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'chat', label: 'Chat' },
  { value: 'portal', label: 'Portal' },
]

/** A property chip that opens a menu (Figma T7: Open · Medium · Assign to me · Team · …). */
function Chip({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: ReactNode
  children: ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-sm border bg-card px-2.5 text-small text-foreground outline-none',
            'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-accent',
          )}
        >
          {icon}
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const chipIcon = (name: IconName) => (
  <Icon name={name} size={14} className="text-muted-foreground" />
)

/**
 * Create a ticket (Figma Interface · T7 New ticket): customer and channel, subject, description,
 * property chips (status, priority, assignee, team, application, labels) and attachments.
 * ⌘/Ctrl + Enter creates.
 */
export function NewTicketDialog({
  open,
  onOpenChange,
  customers,
  agents,
  meId,
  teams,
  applications,
  labels,
  defaultCustomerId,
  onCreate,
}: NewTicketDialogProps) {
  const blank = () => ({
    customerId: defaultCustomerId ?? '',
    channel: 'phone' as TicketChannel,
    subject: '',
    description: '',
    status: 'open' as TicketStatus,
    priority: 'medium' as TicketPriority,
    assigneeId: meId as string | undefined,
    team: teams[0] ?? '',
    application: undefined as string | undefined,
    labels: [] as string[],
    attachments: [] as { name: string; size: number }[],
  })
  const [form, setForm] = useState(blank)
  const [another, setAnother] = useState(false)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [tried, setTried] = useState(false)
  const subjectRef = useRef<HTMLInputElement>(null)
  const files = useRef<HTMLInputElement>(null)
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  const customer = customers.find((c) => c.id === form.customerId)
  const assignee = agents.find((a) => a.id === form.assigneeId)
  const errors = {
    customer: !form.customerId ? 'Pick a customer' : undefined,
    subject: !form.subject.trim() ? 'Add a subject' : undefined,
  }

  const create = () => {
    setTried(true)
    if (errors.customer || errors.subject) return
    onCreate(
      { ...form, subject: form.subject.trim(), description: form.description.trim() },
      another,
    )
    if (another) {
      setForm(blank())
      setTried(false)
      requestAnimationFrame(() => subjectRef.current?.focus())
    } else onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) {
          setForm(blank())
          setTried(false)
        }
      }}
      title="New ticket"
      size="lg"
      footer={
        <>
          <input
            ref={files}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const picked = [...(e.target.files ?? [])].map((f) => ({
                name: f.name,
                size: f.size,
              }))
              set({ attachments: [...form.attachments, ...picked] })
              e.target.value = ''
            }}
          />
          <IconButton
            icon="paperclip"
            label="Attach files"
            onClick={() => files.current?.click()}
          />
          {form.attachments.length > 0 && (
            <span className="text-small text-muted-foreground">
              {form.attachments.length} {form.attachments.length === 1 ? 'file' : 'files'}
            </span>
          )}
          <span className="me-auto" />
          <Switch size="sm" checked={another} onCheckedChange={setAnother} label="Create another" />
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={create}>Create ticket</Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          create()
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            create()
          }
        }}
      >
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Customer" required error={tried ? errors.customer : undefined}>
            <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    'flex h-9 w-full items-center gap-2 rounded-md border bg-card px-3 text-left text-body outline-none',
                    'hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring aria-expanded:bg-accent',
                    tried && errors.customer && 'border-destructive',
                  )}
                >
                  <Icon name="user" size={14} className="text-muted-foreground" />
                  <span
                    className={cn(
                      'min-w-0 flex-1 truncate',
                      customer ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {customer ? customer.name : 'Search name, phone or email'}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-80">
                <PickerList
                  label="Customers"
                  placeholder="Search name, phone or email"
                  options={customers.map((c) => ({
                    value: c.id,
                    label: c.name,
                    meta: c.detail,
                    keywords: c.detail,
                    selected: c.id === form.customerId,
                    icon: <Avatar name={c.name} size="xs" aria-hidden />,
                  }))}
                  onSelect={(id) => {
                    set({ customerId: id })
                    setCustomerOpen(false)
                  }}
                />
              </PopoverContent>
            </Popover>
          </FormField>
          <FormField label="Channel">
            <Select
              value={form.channel}
              onValueChange={(v) => set({ channel: v as TicketChannel })}
              options={CHANNELS}
            />
          </FormField>
        </div>
        <FormField label="Subject" required error={tried ? errors.subject : undefined}>
          <Input
            ref={subjectRef}
            placeholder="What is the problem?"
            value={form.subject}
            onChange={(e) => set({ subject: e.target.value })}
          />
        </FormField>
        <FormField label="Description" optional>
          <Textarea
            rows={4}
            placeholder="Add details, steps already tried, or paste the customer’s message…"
            value={form.description}
            onChange={(e) => set({ description: e.target.value })}
          />
        </FormField>

        <div role="group" aria-label="Ticket properties" className="flex flex-wrap gap-2">
          <Chip
            icon={<StatusGlyph status={form.status} label={null} />}
            label={TICKET_STATUS_LABEL[form.status]}
          >
            <DropdownMenuRadioGroup
              value={form.status}
              onValueChange={(v) => set({ status: v as TicketStatus })}
            >
              {TICKET_STATUSES.map((s) => (
                <DropdownMenuRadioItem key={s} value={s}>
                  {TICKET_STATUS_LABEL[s]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </Chip>
          <Chip
            icon={<PriorityGlyph priority={form.priority} label={null} />}
            label={TICKET_PRIORITY_LABEL[form.priority]}
          >
            <DropdownMenuRadioGroup
              value={form.priority}
              onValueChange={(v) => set({ priority: v as TicketPriority })}
            >
              {[...TICKET_PRIORITIES].reverse().map((p) => (
                <DropdownMenuRadioItem key={p} value={p}>
                  {TICKET_PRIORITY_LABEL[p]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </Chip>
          <Chip
            icon={chipIcon('user')}
            label={!assignee ? 'Unassigned' : assignee.id === meId ? 'Assign to me' : assignee.name}
          >
            <DropdownMenuRadioGroup
              value={form.assigneeId ?? 'none'}
              onValueChange={(v) => set({ assigneeId: v === 'none' ? undefined : v })}
            >
              {agents.map((a) => (
                <DropdownMenuRadioItem key={a.id} value={a.id}>
                  {a.id === meId ? `${a.name} (me)` : a.name}
                </DropdownMenuRadioItem>
              ))}
              <DropdownMenuRadioItem value="none">Unassigned</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </Chip>
          <Chip icon={chipIcon('team')} label={form.team}>
            <DropdownMenuRadioGroup value={form.team} onValueChange={(v) => set({ team: v })}>
              {teams.map((t) => (
                <DropdownMenuRadioItem key={t} value={t}>
                  {t}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </Chip>
          <Chip icon={chipIcon('inventory')} label={form.application ?? 'Application'}>
            <DropdownMenuRadioGroup
              value={form.application ?? ''}
              onValueChange={(v) => set({ application: v || undefined })}
            >
              {applications.map((a) => (
                <DropdownMenuRadioItem key={a} value={a}>
                  {a}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </Chip>
          <Chip
            icon={chipIcon('tag')}
            label={form.labels.length ? form.labels.join(', ') : 'Labels'}
          >
            {labels.map((l) => (
              <DropdownMenuCheckboxItem
                key={l}
                checked={form.labels.includes(l)}
                onSelect={(e) => e.preventDefault()}
                onCheckedChange={(on) =>
                  set({ labels: on ? [...form.labels, l] : form.labels.filter((x) => x !== l) })
                }
              >
                {l}
              </DropdownMenuCheckboxItem>
            ))}
          </Chip>
        </div>
      </form>
    </Dialog>
  )
}
