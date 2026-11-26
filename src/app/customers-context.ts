import { createContext, useContext } from 'react'
import type { CustomerTagDef, DuplicateGroup } from '@/mocks'
import type { Customer, CustomerProfile } from '@/types'

export interface CustomerRecord {
  customer: Customer
  profile: CustomerProfile
}

/** Which value to keep per field when merging a duplicate (Figma C4). */
export type MergePicks = Record<'name' | 'phone' | 'email' | 'company' | 'tags', 'a' | 'b'>

export interface CustomersValue {
  records: CustomerRecord[]
  tags: CustomerTagDef[]
  duplicates: DuplicateGroup[]
  /** Open the Add (no id) / Edit customer sheet (Figma C3). */
  editCustomer: (id?: string) => void
  mergeDuplicate: (groupId: string, picks: MergePicks) => void
  dismissDuplicate: (groupId: string) => void
  saveTag: (tag: CustomerTagDef, previousName?: string) => void
  deleteTag: (id: string) => void
}

export const CustomersContext = createContext<CustomersValue>({
  records: [],
  tags: [],
  duplicates: [],
  editCustomer: () => {},
  mergeDuplicate: () => {},
  dismissDuplicate: () => {},
  saveTag: () => {},
  deleteTag: () => {},
})

export const useCustomers = () => useContext(CustomersContext)
