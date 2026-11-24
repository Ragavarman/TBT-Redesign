/** People in the helpdesk: agents (staff) and requesters (customers' contacts). */

export type Presence = 'online' | 'away' | 'offline'

export interface Person {
  id: string
  name: string
  email: string
  /** Photo URL. Falls back to initials. */
  avatarUrl?: string
  presence?: Presence
}

export interface Agent extends Person {
  role: 'agent' | 'lead' | 'admin'
  team: string
}

export interface Customer extends Person {
  organization: string
  openTickets: number
  vip?: boolean
}
