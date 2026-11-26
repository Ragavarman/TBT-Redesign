import { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router'
import { toast } from '@/components/molecules'
import { IncomingCallCard, NewTicketDialog, type NewTicketSubmit } from '@/components/organisms'
import { useHotkeys } from '@/hooks/useHotkeys'
import { WS_NOW, wsAgents, wsCurrentAgent, wsCustomers, wsTickets } from '@/mocks'
import { formatTicketId, type Customer, type Ticket } from '@/types'
import { useCustomers } from './customers-context'
import { ticketPath } from './nav'
import { ShellOverlays } from './ShellOverlays'
import { WorkspaceContext, type TicketChange, type WorkspaceValue } from './workspace-context'

const TEAMS = ['Support Team Alpha', 'Technical Team Beta', 'Sales Team Gamma']
const APPLICATIONS = ['Customer Portal', 'POS', 'Inventory', 'Payments']
const LABELS = ['Voicemail', 'Hardware', 'Billing', 'Payments', 'Access']

/** The demo caller (Figma X11). */
const CALLER: Customer = wsCustomers.dennis
const CALL_KEY = 'tbt-demo-call-shown'

function callAlreadyShown() {
  try {
    return sessionStorage.getItem(CALL_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Root of every screen: tickets created or edited this session, the New ticket dialog (C from
 * anywhere, or any "New ticket" button) and the incoming-call notice. Lives inside the router so
 * it can open what it made.
 */
export function WorkspaceRoot() {
  const navigate = useNavigate()
  const location = useLocation()
  const [created, setCreated] = useState<Ticket[]>([])
  const [edits, setEdits] = useState<Record<number, Partial<Ticket>>>({})
  const [open, setOpen] = useState(false)
  const [prefill, setPrefill] = useState<string>()
  const [calling, setCalling] = useState(() => new URLSearchParams(location.search).has('call'))

  const { records, editCustomer } = useCustomers()
  const customers = useMemo(() => records.map((r) => r.customer), [records])

  // C: New ticket — or Add customer on the Customers pages (Figma C3 shows "Add customer C")
  useHotkeys({
    c: () => (location.pathname.startsWith('/customers') ? editCustomer() : newTicket()),
  })

  // Demo: one incoming call per browser session, a few seconds after the app opens.
  useEffect(() => {
    if (calling || callAlreadyShown()) return
    const t = setTimeout(() => setCalling(true), 6000)
    return () => clearTimeout(t)
  }, [calling])
  useEffect(() => {
    if (!calling) return
    try {
      sessionStorage.setItem(CALL_KEY, '1')
    } catch {
      /* storage unavailable — the call may show again on reload */
    }
  }, [calling])

  // edits applied, and requesters swapped for the latest customer record (renames, merges)
  const tickets = useMemo(() => {
    const byId = new Map(customers.map((c) => [c.id, c]))
    return [...created, ...wsTickets].map((t) => {
      const e = edits[t.id] ? { ...t, ...edits[t.id] } : t
      const requester = byId.get(e.requester.id)
      return requester && requester !== e.requester ? { ...e, requester } : e
    })
  }, [created, edits, customers])

  function newTicket(customerId?: unknown) {
    // buttons pass their click event straight through — only a string is a customer
    setPrefill(typeof customerId === 'string' ? customerId : undefined)
    setOpen(true)
  }

  const value = useMemo<WorkspaceValue>(
    () => ({
      tickets,
      addTicket: (t) => setCreated((list) => [t, ...list]),
      updateTickets: (changes: TicketChange[]) =>
        setEdits((e) => {
          const next = { ...e }
          for (const { id, patch } of changes) next[id] = { ...next[id], ...patch }
          return next
        }),
      newTicket: (customerId) => newTicket(customerId),
    }),
    [tickets],
  )

  const create = (f: NewTicketSubmit, another: boolean) => {
    const id = Math.max(...tickets.map((t) => t.id)) + 1
    const ticket: Ticket = {
      id,
      subject: f.subject,
      preview: f.description || f.subject,
      status: f.status,
      priority: f.priority,
      requester: customers.find((c) => c.id === f.customerId) ?? wsCustomers.dennis,
      assignee: Object.values(wsAgents).find((a) => a.id === f.assigneeId),
      team: f.team,
      channel: f.channel,
      tags: f.labels,
      createdAt: WS_NOW,
      updatedAt: WS_NOW,
      messageCount: 1,
    }
    setCreated((list) => [ticket, ...list])
    toast.success(`${formatTicketId(id)} created`, {
      action: { label: 'Open', onClick: () => navigate(ticketPath('all', id)) },
    })
    if (!another) navigate(ticketPath('all', id))
  }

  const callerTickets = tickets.filter(
    (t) => t.requester.id === CALLER.id && t.status !== 'resolved' && t.status !== 'closed',
  )

  return (
    <WorkspaceContext.Provider value={value}>
      <ShellOverlays>
        <Outlet />
      </ShellOverlays>
      <NewTicketDialog
        // remount so a call's caller is picked when it opens
        key={prefill ?? 'blank'}
        open={open}
        onOpenChange={setOpen}
        customers={customers.map((c) => ({
          id: c.id,
          name: c.organization ? `${c.name} · ${c.organization}` : c.name,
          detail: c.phone ?? c.email,
        }))}
        agents={Object.values(wsAgents)}
        meId={wsCurrentAgent.id}
        teams={TEAMS}
        applications={APPLICATIONS}
        labels={LABELS}
        defaultCustomerId={prefill}
        onCreate={create}
      />
      {calling && (
        <IncomingCallCard
          caller={{ name: CALLER.name, phone: CALLER.phone ?? '' }}
          tags={['Frequent caller']}
          source="RingCentral · main line"
          openTickets={callerTickets.map((t) => ({
            id: t.id,
            label: formatTicketId(t.id),
            subject: t.subject,
            status: t.status,
          }))}
          startedSeconds={3}
          onOpenTicket={(id) => {
            setCalling(false)
            navigate(ticketPath('all', id))
          }}
          onNewTicket={() => {
            setCalling(false)
            newTicket(CALLER.id)
          }}
          onDismiss={() => setCalling(false)}
        />
      )}
    </WorkspaceContext.Provider>
  )
}
