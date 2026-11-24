import type { Asset } from '@/types'
import { agents, customers } from './people'

/** Inventory assets covering every condition. */
export const assets: Asset[] = [
  {
    id: 'as1',
    name: 'HP LaserJet 4',
    model: 'M404dn',
    serial: 'PHB3K21',
    condition: 'needs-repair',
    location: 'Floor 3',
  },
  {
    id: 'as2',
    name: 'MacBook Pro 14"',
    model: 'M3 Pro',
    serial: 'C02XK1',
    condition: 'good',
    location: 'Remote',
    assignedTo: customers[1],
  },
  {
    id: 'as3',
    name: 'Epson projector',
    model: 'EB-L520',
    serial: 'X4LZ09',
    condition: 'good',
    location: 'Meeting room B',
  },
  {
    id: 'as4',
    name: 'Dell monitor 27"',
    model: 'U2723QE',
    serial: 'CN0F2',
    condition: 'retired',
    location: 'Storage',
  },
  {
    id: 'as5',
    name: 'Cisco access point',
    model: 'C9120',
    serial: 'FGL2231',
    condition: 'good',
    location: 'Floor 3',
    assignedTo: agents[2],
  },
]
