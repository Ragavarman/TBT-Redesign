import type { Agent, Customer } from '@/types'

/** Support agents (staff). */
export const agents: Agent[] = [
  {
    id: 'a1',
    name: 'Tharsan L.',
    email: 'tharsan@tbt.example',
    role: 'lead',
    team: 'Support Team Alpha',
    presence: 'online',
  },
  {
    id: 'a2',
    name: 'Nila P.',
    email: 'nila@tbt.example',
    role: 'agent',
    team: 'Support Team Alpha',
    presence: 'online',
  },
  {
    id: 'a3',
    name: 'Kavin S.',
    email: 'kavin@tbt.example',
    role: 'agent',
    team: 'Hardware',
    presence: 'away',
  },
  {
    id: 'a4',
    name: 'Meera R.',
    email: 'meera@tbt.example',
    role: 'agent',
    team: 'Billing',
    presence: 'offline',
  },
  {
    id: 'a5',
    name: 'Arun K.',
    email: 'arun@tbt.example',
    role: 'admin',
    team: 'IT Ops',
    presence: 'online',
  },
]

/** Requesters (customer contacts). */
export const customers: Customer[] = [
  {
    id: 'c1',
    name: 'Dana Whitfield',
    email: 'dana@northwind.example',
    organization: 'Northwind',
    openTickets: 4,
  },
  {
    id: 'c2',
    name: 'Amir Malik',
    email: 'amir@contoso.example',
    organization: 'Contoso',
    openTickets: 1,
  },
  {
    id: 'c3',
    name: 'Nia Park',
    email: 'nia@fabrikam.example',
    organization: 'Fabrikam',
    openTickets: 2,
    vip: true,
  },
  {
    id: 'c4',
    name: 'Jonas Berg',
    email: 'jonas@litware.example',
    organization: 'Litware',
    openTickets: 0,
  },
  {
    id: 'c5',
    name: 'Priya Natarajan',
    email: 'priya@adatum.example',
    organization: 'Adatum',
    openTickets: 3,
  },
  {
    id: 'c6',
    name: 'Lucas Moreau',
    email: 'lucas@tailspin.example',
    organization: 'Tailspin',
    openTickets: 1,
    vip: true,
  },
  {
    id: 'c7',
    name: 'Sofia Rossi',
    email: 'sofia@woodgrove.example',
    organization: 'Woodgrove',
    openTickets: 2,
  },
  {
    id: 'c8',
    name: 'Hiro Tanaka',
    email: 'hiro@proseware.example',
    organization: 'Proseware',
    openTickets: 1,
  },
]

/** The signed-in agent in stories. */
export const currentAgent = agents[0]!
