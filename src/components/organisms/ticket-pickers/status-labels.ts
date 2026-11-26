import type { TicketStatus } from '@/types'

/** Workflow names the status picker uses (Figma X1): the long form of each status. */
export const STATUS_PICKER_LABEL: Record<TicketStatus, string> = {
  open: 'Needs first response',
  investigating: 'Investigating',
  waiting: 'Waiting for customer',
  'on-hold': 'On hold',
  resolved: 'Resolved',
  closed: 'Closed',
}
