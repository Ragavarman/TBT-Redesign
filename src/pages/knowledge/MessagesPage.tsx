import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Avatar, Button, Input, Textarea } from '@/components/atoms'
import { FormField, toast } from '@/components/molecules'
import { Dialog, DialogClose, PageHeader } from '@/components/organisms'
import { AppShell, Panel } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import { cn } from '@/lib/utils'
import type { SmsThread } from '@/mocks'
import { formatTicketId } from '@/types'

/**
 * Figma Interface · K5 Knowledge — Messages: SMS conversations on the left, the thread on the
 * right with a 160-character composer; Open ticket jumps to the linked ticket; New message
 * starts a conversation.
 */

const LIMIT = 160

export interface MessagesPageProps {
  sidebar: ReactNode
  threads: SmsThread[]
  onSend: (threadId: string, text: string) => void
  onRead: (threadId: string) => void
  onNew: (phone: string, text: string) => string
  onOpenTicket: (id: number) => void
}

export function MessagesPage({
  sidebar,
  threads,
  onSend,
  onRead,
  onNew,
  onOpenTicket,
}: MessagesPageProps) {
  const [activeId, setActiveId] = useState(threads[0]?.id)
  const active = threads.find((t) => t.id === activeId) ?? threads[0]
  const [draft, setDraft] = useState('')
  const [composing, setComposing] = useState(false)
  const [to, setTo] = useState('')
  const [first, setFirst] = useState('')
  const end = useRef<HTMLDivElement>(null)
  const unread = threads.filter((t) => t.unread).length

  useEffect(() => {
    if (active?.unread) onRead(active.id)
    end.current?.scrollIntoView({ block: 'end' })
  }, [active?.id, active?.messages.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const index = active ? threads.indexOf(active) : -1
  useHotkeys({
    j: () => threads[index + 1] && setActiveId(threads[index + 1]!.id),
    k: () => threads[index - 1] && setActiveId(threads[index - 1]!.id),
    c: () => setComposing(true),
  })

  const send = () => {
    const text = draft.trim()
    if (!text || !active) return
    onSend(active.id, text)
    setDraft('')
  }

  return (
    <AppShell sidebar={sidebar}>
      <Panel>
        <PageHeader
          icon="mail"
          title="Messages"
          count={`SMS · ${unread} unread`}
          actions={
            <Button leadingIcon="plus" shortcut="C" onClick={() => setComposing(true)}>
              New message
            </Button>
          }
        />
        <div className="flex min-h-0 flex-1">
          <nav
            aria-label="Conversations"
            className="flex w-80 shrink-0 flex-col gap-0.5 overflow-y-auto border-r p-2"
          >
            {threads.map((t) => {
              const last = t.messages.at(-1)
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-current={t.id === active?.id ? 'true' : undefined}
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    'flex items-start gap-3 rounded-md px-2 py-2 text-left outline-none',
                    'transition-colors duration-150 hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                    t.id === active?.id && 'bg-muted',
                  )}
                >
                  <Avatar name={t.name} size="sm" aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span
                      className={cn(
                        'truncate text-body text-foreground',
                        t.unread && 'text-body-strong',
                      )}
                    >
                      {t.name}
                    </span>
                    <span className="truncate text-small text-muted-foreground">
                      {last?.from === 'agent' ? 'You: ' : ''}
                      {last?.text}
                    </span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-caption text-muted-foreground">{t.last}</span>
                    {t.unread && (
                      <span aria-label="Unread" className="size-1.5 rounded-full bg-primary" />
                    )}
                  </span>
                </button>
              )
            })}
          </nav>
          {active && (
            <section
              aria-label={`Conversation with ${active.name}`}
              className="flex min-w-0 flex-1 flex-col"
            >
              <header className="flex shrink-0 items-center gap-3 border-b px-5 py-3">
                <Avatar name={active.name} size="sm" aria-hidden />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-label text-foreground">{active.name}</span>
                  <span className="truncate text-small text-muted-foreground">
                    {active.phone}
                    {active.ticketId && ` · linked to ${formatTicketId(active.ticketId)}`}
                  </span>
                </div>
                {active.ticketId && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenTicket(active.ticketId!)}
                  >
                    Open ticket
                  </Button>
                )}
              </header>
              <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
                <p className="text-caption text-muted-foreground">Today</p>
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      'flex max-w-[70%] flex-col gap-1 rounded-lg px-3 py-2 text-body',
                      m.from === 'agent'
                        ? 'self-end bg-muted text-foreground'
                        : 'self-start border bg-card text-foreground',
                    )}
                  >
                    {m.text}
                    <span
                      className={cn(
                        'text-caption text-muted-foreground',
                        m.from === 'agent' && 'self-end',
                      )}
                    >
                      {m.time}
                      {m.agent && ` · ${m.agent}`}
                    </span>
                  </div>
                ))}
                <div ref={end} />
              </div>
              <form
                className="flex shrink-0 items-end gap-2 border-t p-3"
                onSubmit={(e) => {
                  e.preventDefault()
                  send()
                }}
              >
                <Textarea
                  aria-label={`Text ${active.name}`}
                  rows={1}
                  placeholder={`Text ${active.name.split(' ')[0]}…`}
                  value={draft}
                  maxLength={LIMIT}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  className="min-h-9 flex-1"
                />
                <span className="pb-2 text-caption text-muted-foreground tabular-nums">
                  {draft.length} / {LIMIT}
                </span>
                <Button type="submit" disabled={!draft.trim()}>
                  Send
                </Button>
              </form>
            </section>
          )}
        </div>
      </Panel>
      <Dialog
        open={composing}
        onOpenChange={(o) => {
          setComposing(o)
          if (!o) {
            setTo('')
            setFirst('')
          }
        }}
        title="New message"
        description="Sends an SMS from the TBT Support number."
        size="sm"
        footer={
          <>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              disabled={!/\d{7,}/.test(to.replace(/\D/g, '')) || !first.trim()}
              onClick={() => {
                const id = onNew(to.trim(), first.trim())
                setActiveId(id)
                setComposing(false)
                setTo('')
                setFirst('')
                toast.success('Message sent')
              }}
            >
              Send
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="To" required helper="A phone number, e.g. (909) 802-3652">
            <Input type="tel" value={to} onChange={(e) => setTo(e.target.value)} autoFocus />
          </FormField>
          <FormField label="Message" required>
            <Textarea
              rows={3}
              maxLength={LIMIT}
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </FormField>
        </div>
      </Dialog>
    </AppShell>
  )
}
