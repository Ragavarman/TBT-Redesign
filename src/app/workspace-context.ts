import { createContext, useContext } from 'react'
import { wsTickets } from '@/mocks'
import type { TicketChange } from '@/pages/tickets/ticket-view'
import type { Ticket } from '@/types'

export type { TicketChange }

export interface WorkspaceValue {
  /** Every ticket: ones created in this session first, then the mock workspace, with edits applied. */
  tickets: Ticket[]
  addTicket: (t: Ticket) => void
  /** Edit tickets (bulk actions). Pass the previous values back to undo. */
  updateTickets: (changes: TicketChange[]) => void
  /** Open the New ticket dialog (C, or any "New ticket" button), optionally for a customer. */
  newTicket: (customerId?: string) => void
}

export const WorkspaceContext = createContext<WorkspaceValue>({
  tickets: wsTickets,
  addTicket: () => {},
  updateTickets: () => {},
  newTicket: () => {},
})

export const useWorkspace = () => useContext(WorkspaceContext)
