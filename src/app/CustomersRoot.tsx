import { useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { toast } from '@/components/molecules'
import { CustomerSheet, type CustomerFormValues } from '@/components/organisms'
import {
  WS_NOW,
  wsCustomerList,
  wsCustomerProfile,
  wsCompanies,
  wsDuplicates,
  wsTagDefs,
  type CompanyRecord,
  type CustomerTagDef,
  type DuplicateGroup,
} from '@/mocks'
import {
  CustomersContext,
  type CustomerRecord,
  type CustomersValue,
  type MergePicks,
} from './customers-context'

const LOCATIONS = ['Colombo 03', 'Colombo 07', 'Kandy', 'Galle', 'Negombo', 'Jaffna']

const split = (name: string) => {
  const [first = '', ...rest] = name.split(' ')
  return { firstName: first, lastName: rest.join(' ') }
}

/**
 * Customers for the session: edits, new customers, merges and tags (Figma Interface · Customers
 * C3, C4, C5). Wraps the workspace so tickets show the latest customer names. Hosts the Add /
 * Edit customer sheet.
 */
export function CustomersRoot() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<CustomerRecord[]>(() =>
    wsCustomerList.map((customer) => ({ customer, profile: wsCustomerProfile(customer.id)! })),
  )
  const [tags, setTags] = useState<CustomerTagDef[]>(wsTagDefs)
  const [duplicates, setDuplicates] = useState<DuplicateGroup[]>(wsDuplicates)
  const [companyList, setCompanyList] = useState<CompanyRecord[]>(wsCompanies)
  // the sheet: undefined = closed, null = add, id = edit
  const [editing, setEditing] = useState<string | null | undefined>(undefined)

  const editingRecord = editing ? records.find((r) => r.customer.id === editing) : undefined
  // the company picker offers every listed company plus any typed on a customer
  const companies = [
    ...new Set([
      ...companyList.map((c) => c.name),
      ...records.map((r) => r.profile.company).filter((c): c is string => !!c),
    ]),
  ].sort()

  const save = (v: CustomerFormValues) => {
    const name = [v.firstName, v.lastName].filter(Boolean).join(' ')
    if (editingRecord) {
      const id = editingRecord.customer.id
      setRecords((list) =>
        list.map((r) =>
          r.customer.id !== id
            ? r
            : {
                customer: {
                  ...r.customer,
                  name,
                  phone: v.phone || undefined,
                  email: v.email,
                  organization: v.company,
                },
                profile: {
                  ...r.profile,
                  company: v.company || undefined,
                  location: v.location || undefined,
                  tags: v.tags,
                  notes:
                    v.notes && !r.profile.notes.some((n) => n.body === v.notes)
                      ? [
                          {
                            id: `sheet-${Date.now()}`,
                            author: { name: 'Team Lead' },
                            body: v.notes,
                            at: WS_NOW,
                            pinned: true,
                          },
                          ...r.profile.notes,
                        ]
                      : r.profile.notes,
                },
              },
        ),
      )
      toast.success(`${name} updated`)
    } else {
      const id = `new-${Date.now().toString(36)}`
      setRecords((list) => [
        {
          customer: {
            id,
            name,
            email: v.email,
            phone: v.phone || undefined,
            organization: v.company,
            openTickets: 0,
          },
          profile: {
            customerId: id,
            company: v.company || undefined,
            location: v.location || undefined,
            since: WS_NOW.slice(0, 10),
            source: 'Added by an agent',
            tags: v.tags,
            notes: v.notes
              ? [
                  {
                    id: 'first',
                    author: { name: 'Team Lead' },
                    body: v.notes,
                    at: WS_NOW,
                    pinned: true,
                  },
                ]
              : [],
            assets: [],
            calls: [],
            stats: { lastContact: 'Never', avgResolution: '—' },
          },
        },
        ...list,
      ])
      toast.success(`${name} added`, {
        action: { label: 'Open', onClick: () => navigate(`/customers/all/${id}`) },
      })
      navigate(`/customers/all/${id}`)
    }
  }

  const value = useMemo<CustomersValue>(
    () => ({
      records,
      tags,
      duplicates,
      companies: companyList,
      addCompany: (c) => setCompanyList((list) => [...list, c]),
      editCustomer: (id) => setEditing(typeof id === 'string' ? id : null),
      mergeDuplicate: (groupId, picks: MergePicks) => {
        const g = duplicates.find((d) => d.id === groupId)
        if (!g) return
        setRecords((list) =>
          list.map((r) => {
            if (r.customer.id !== g.customerId) return r
            const b = g.other
            const pick = <T,>(field: keyof MergePicks, a: T, bv: T) =>
              picks[field] === 'b' ? bv : a
            return {
              customer: {
                ...r.customer,
                name: pick('name', r.customer.name, b.name),
                phone: pick('phone', r.customer.phone, b.phone),
                email: pick('email', r.customer.email, b.email ?? r.customer.email),
                organization: pick('company', r.customer.organization, b.company ?? ''),
              },
              profile: {
                ...r.profile,
                company: pick('company', r.profile.company, b.company),
                tags: pick('tags', r.profile.tags, b.tags),
                needsReview: false,
              },
            }
          }),
        )
        setDuplicates((list) => list.filter((d) => d.id !== groupId))
      },
      dismissDuplicate: (groupId) => {
        setDuplicates((list) => list.filter((d) => d.id !== groupId))
        const g = duplicates.find((d) => d.id === groupId)
        if (g)
          setRecords((list) =>
            list.map((r) =>
              r.customer.id === g.customerId
                ? { ...r, profile: { ...r.profile, needsReview: false } }
                : r,
            ),
          )
      },
      saveTag: (tag, previousName) => {
        setTags((list) =>
          list.some((t) => t.id === tag.id)
            ? list.map((t) => (t.id === tag.id ? tag : t))
            : [...list, tag],
        )
        if (previousName && previousName !== tag.name)
          setRecords((list) =>
            list.map((r) =>
              r.profile.tags.includes(previousName)
                ? {
                    ...r,
                    profile: {
                      ...r.profile,
                      tags: r.profile.tags.map((t) => (t === previousName ? tag.name : t)),
                    },
                  }
                : r,
            ),
          )
      },
      deleteTag: (id) => {
        const tag = tags.find((t) => t.id === id)
        setTags((list) => list.filter((t) => t.id !== id))
        if (tag)
          setRecords((list) =>
            list.map((r) => ({
              ...r,
              profile: { ...r.profile, tags: r.profile.tags.filter((t) => t !== tag.name) },
            })),
          )
      },
    }),
    [records, tags, duplicates, companyList],
  )

  return (
    <CustomersContext.Provider value={value}>
      <Outlet />
      <CustomerSheet
        // fresh form per customer / per open
        key={editing === undefined ? 'closed' : (editing ?? 'add')}
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
        mode={editingRecord ? 'edit' : 'add'}
        initial={
          editingRecord
            ? {
                ...split(editingRecord.customer.name),
                phone: editingRecord.customer.phone ?? '',
                email: editingRecord.customer.email,
                company: editingRecord.profile.company ?? '',
                location: editingRecord.profile.location ?? '',
                tags: editingRecord.profile.tags,
              }
            : undefined
        }
        companies={companies}
        locations={LOCATIONS}
        tags={tags.map((t) => t.name)}
        onSave={save}
        onDelete={
          editingRecord
            ? () => {
                const { id, name } = editingRecord.customer
                setRecords((list) => list.filter((r) => r.customer.id !== id))
                toast.success(`${name} deleted`)
                navigate('/customers/all')
              }
            : undefined
        }
      />
    </CustomersContext.Provider>
  )
}
