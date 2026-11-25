import { useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { toast } from '@/components/molecules'
import { NewTicketDialog, type NewTicketSubmit } from '@/components/organisms'
import { useHotkeys } from '@/hooks/useHotkeys'
import { WS_NOW, wsAgents, wsCurrentAgent, wsCustomers, wsTickets } from '@/mocks'
import { formatTicketId, type Ticket } from '@/types'
import { ticketPath } from './nav'
import { WorkspaceContext, type WorkspaceValue } from './workspace-context'

const customers = Object.values(wsCustomers)
const TEAMS = ['Support Team Alpha', 'Technical Team Beta', 'Sales Team Gamma']
const APPLICATIONS = ['Customer Portal', 'POS', 'Inventory', 'Payments']
const LABELS = ['Voicemail', 'Hardware', 'Billing', 'Payments', 'Access']

/**
 * Root of every screen: tickets created this session, and the New ticket dialog (C from
 * anywhere, or any "New ticket" button). Lives inside the router so it can open what it made.
 */
export function WorkspaceRoot() {
  const navigate = useNavigate()
  const [created, setCreated] = useState<Ticket[]>([])
  const [open, setOpen] = useState(false)

  useHotkeys({ c: () => setOpen(true) })

  const tickets = useMemo(() => [...created, ...wsTickets], [created])
  const value = useMemo<WorkspaceValue>(
    () => ({
      tickets,
      addTicket: (t) => setCreated((list) => [t, ...list]),
      newTicket: () => setOpen(true),
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
      requester: customers.find((c) => c.id === f.customerId)!,
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

  return (
    <WorkspaceContext.Provider value={value}>
      <Outlet />
      <NewTicketDialog
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
        onCreate={create}
      />
    </WorkspaceContext.Provider>
  )
}
