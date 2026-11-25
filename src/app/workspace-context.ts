import { createContext, useContext } from 'react'
import { wsTickets } from '@/mocks'
import type { Ticket } from '@/types'

export interface WorkspaceValue {
  /** Every ticket: ones created in this session first, then the mock workspace. */
  tickets: Ticket[]
  addTicket: (t: Ticket) => void
  /** Open the New ticket dialog (C, or any "New ticket" button). */
  newTicket: () => void
}

export const WorkspaceContext = createContext<WorkspaceValue>({
  tickets: wsTickets,
  addTicket: () => {},
  newTicket: () => {},
})

export const useWorkspace = () => useContext(WorkspaceContext)
