import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Avatar, Badge, Button, Icon } from '@/components/atoms'
import { ConditionBadge, toast } from '@/components/molecules'
import {
  ConfirmationModal,
  ImportCsvDialog,
  RecordSheet,
  type RecordField,
  type RecordValues,
} from '@/components/organisms'
import { CONDITION_VIEW, type InventoryItem } from '@/mocks'
import { ItemDetailPage } from '@/pages/inventory/ItemDetailPage'
import { PersonCell, ResourceListPage } from '@/pages/kit/ResourceListPage'
import { ASSET_CONDITION_LABEL, ASSET_CONDITIONS, type AssetCondition } from '@/types'
import { AppSidebar } from './AppSidebar'
import { newId } from './collections-context'
import { useCustomers } from './customers-context'
import { ticketPath } from './nav'
import { useBrands, useCategories, useInventoryItems, useLocations } from './stores'
import { useWorkspace } from './workspace-context'

const CONDITION_BY_LABEL = Object.fromEntries(
  ASSET_CONDITIONS.map((c) => [ASSET_CONDITION_LABEL[c], c]),
) as Record<string, AssetCondition>
const NO_CUSTOMER = 'No customer'
const dateField = (v: RecordValues[string]) =>
  !v || /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? undefined : 'Use YYYY-MM-DD'

/** The Add / Edit item form (Figma 07b) — shared by the list and the detail page. */
function useItemForm() {
  const items = useInventoryItems()
  const brands = useBrands()
  const categories = useCategories()
  const locations = useLocations()
  const { records } = useCustomers()
  const customers = records.map((r) => r.customer)

  const fields = (editingId?: string): RecordField[] => [
    { name: 'name', label: 'Name', type: 'text', required: true },
    {
      name: 'brand',
      label: 'Brand',
      type: 'select',
      half: true,
      options: brands.items.map((b) => b.name),
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      half: true,
      options: categories.items.map((c) => c.name),
    },
    {
      name: 'serial',
      label: 'Serial number',
      type: 'text',
      half: true,
      required: true,
      validate: (v) =>
        items.items.some((i) => i.serial === String(v).trim() && i.id !== editingId)
          ? 'Another item has this serial'
          : undefined,
    },
    { name: 'model', label: 'Model', type: 'text', half: true },
    {
      name: 'customer',
      label: 'Customer',
      type: 'select',
      helper: 'Optional — who owns or uses it',
      options: [NO_CUSTOMER, ...customers.map((c) => c.name)],
    },
    {
      name: 'location',
      label: 'Location',
      type: 'select',
      half: true,
      options: locations.items.map((l) => l.name),
    },
    {
      name: 'condition',
      label: 'Condition',
      type: 'select',
      half: true,
      options: ASSET_CONDITIONS.map((c) => ASSET_CONDITION_LABEL[c]),
    },
    {
      name: 'purchased',
      label: 'Purchased',
      type: 'text',
      half: true,
      placeholder: 'YYYY-MM-DD',
      validate: dateField,
    },
    {
      name: 'warrantyUntil',
      label: 'Warranty until',
      type: 'text',
      half: true,
      placeholder: 'YYYY-MM-DD',
      validate: dateField,
    },
  ]
  const toValues = (i: InventoryItem) => ({
    ...i,
    customer: customers.find((c) => c.id === i.customerId)?.name ?? NO_CUSTOMER,
    condition: ASSET_CONDITION_LABEL[i.condition],
  })
  const fromValues = (v: RecordValues, prev?: InventoryItem): InventoryItem => ({
    id: prev?.id ?? newId('it'),
    name: String(v.name),
    brand: String(v.brand),
    category: String(v.category),
    serial: String(v.serial),
    model: String(v.model),
    location: String(v.location),
    condition: CONDITION_BY_LABEL[String(v.condition)] ?? 'good',
    customerId: customers.find((c) => c.name === v.customer)?.id,
    assignedTo: prev?.assignedTo,
    purchased: String(v.purchased) || '2026-11-25',
    warrantyUntil: String(v.warrantyUntil) || '2027-11-25',
    history: prev
      ? [{ when: 'Today', text: 'Edited by Team Lead' }, ...prev.history]
      : [{ when: 'Today', text: 'Added by Team Lead' }],
  })
  const blank: RecordValues = {
    brand: brands.items[0]?.name ?? '',
    category: categories.items[0]?.name ?? '',
    customer: NO_CUSTOMER,
    location: locations.items[0]?.name ?? '',
    condition: 'Good',
  }
  return { items, brands, categories, locations, customers, fields, toValues, fromValues, blank }
}

/** /inventory/:view — Items (and condition views), Brands, Categories, Locations. */
export function InventoryViewRoute({ view }: { view: string }) {
  const navigate = useNavigate()
  const form = useItemForm()
  const { items, brands, categories, locations } = form
  const [editing, setEditing] = useState<string | null | undefined>(undefined)
  const [importing, setImporting] = useState(false)
  const sidebar = <AppSidebar />
  const close = {
    open: editing !== undefined,
    onOpenChange: (o: boolean) => !o && setEditing(undefined),
    key: editing === undefined ? 'closed' : (editing ?? 'new'),
  }

  if (view === 'items' || CONDITION_VIEW[view]) {
    const condition = CONDITION_VIEW[view]
    const rows = condition ? items.items.filter((i) => i.condition === condition) : items.items
    const customerName = (id?: string) => form.customers.find((c) => c.id === id)?.name
    return (
      <ResourceListPage
        sidebar={sidebar}
        icon="inventory"
        title={condition ? ASSET_CONDITION_LABEL[condition] : 'Items'}
        rows={rows}
        getId={(i) => i.id}
        searchText={(i) =>
          `${i.name} ${i.model} ${i.serial} ${i.brand} ${i.location} ${customerName(i.customerId) ?? i.assignedTo ?? ''}`
        }
        searchPlaceholder="Search name, serial, model or customer"
        onRowClick={(i) => navigate(`/inventory/items/${i.id}`)}
        actions={
          <>
            <Button variant="secondary" leadingIcon="upload" onClick={() => setImporting(true)}>
              Import CSV
            </Button>
            <Button leadingIcon="plus" onClick={() => setEditing(null)}>
              Add item
            </Button>
          </>
        }
        columns={[
          {
            key: 'item',
            label: 'Item',
            sort: (i) => i.name,
            render: (i) => (
              <span className="flex min-w-0 flex-col">
                <span className="truncate">{i.name}</span>
                <span className="truncate text-small text-muted-foreground">
                  {i.brand} {i.model}
                </span>
              </span>
            ),
          },
          {
            key: 'category',
            label: 'Category',
            className: 'w-36',
            sort: (i) => i.category,
            render: (i) => <span className="text-muted-foreground">{i.category}</span>,
          },
          {
            key: 'serial',
            label: 'Serial',
            className: 'w-36',
            render: (i) => (
              <span className="text-small text-muted-foreground tabular-nums">{i.serial}</span>
            ),
          },
          {
            key: 'location',
            label: 'Location',
            className: 'w-32',
            sort: (i) => i.location,
            render: (i) => i.location,
          },
          {
            key: 'assigned',
            label: 'Assigned to',
            className: 'w-44',
            render: (i) => {
              const n = customerName(i.customerId) ?? i.assignedTo
              return n ? <PersonCell name={n} /> : <span className="text-muted-foreground">—</span>
            },
          },
          {
            key: 'condition',
            label: 'Condition',
            className: 'w-36',
            sort: (i) => i.condition,
            render: (i) => <ConditionBadge condition={i.condition} />,
          },
        ]}
        empty={{
          title: condition
            ? `No items in ${ASSET_CONDITION_LABEL[condition].toLowerCase()} condition`
            : 'Track the devices your customers use',
          description:
            'Link printers, card readers and scanners to tickets so you can see warranty and history straight away.',
          action: condition ? undefined : (
            <ol className="flex w-80 flex-col gap-1 rounded-lg border p-2 text-left">
              {[
                {
                  done: brands.items.length > 0,
                  label: 'Add brands',
                  hint:
                    brands.items
                      .slice(0, 3)
                      .map((b) => b.name)
                      .join(', ') || 'Epson, Verifone, Zebra…',
                  go: () => navigate('/inventory/brands'),
                },
                {
                  done: categories.items.length > 0,
                  label: 'Add categories',
                  hint: 'Printers, POS terminals, scanners',
                  go: () => navigate('/inventory/categories'),
                },
                {
                  done: false,
                  label: 'Add items',
                  hint: 'One by one, or import a CSV',
                  go: () => setEditing(null),
                },
              ].map((s, i) => (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={s.go}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-caption">
                      {s.done ? <Icon name="check" size={12} className="text-success" /> : i + 1}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-body text-foreground">{s.label}</span>
                      <span className="text-small text-muted-foreground">{s.hint}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          ),
        }}
      >
        <RecordSheet
          {...close}
          title="Add item"
          saveLabel="Add item"
          fields={form.fields()}
          initial={form.blank}
          onSave={(v) => {
            const it = form.fromValues(v)
            items.add(it)
            toast.success(`${it.name} added`, {
              action: { label: 'Open', onClick: () => navigate(`/inventory/items/${it.id}`) },
            })
          }}
        />
        <ImportCsvDialog
          open={importing}
          onOpenChange={setImporting}
          noun="items"
          requiredField="serial"
          template={['device_name', 'brand', 'type', 'serial', 'model', 'location']}
          fields={[
            { value: 'name', label: 'Name', aliases: ['device', 'device_name', 'item'] },
            { value: 'brand', label: 'Brand', aliases: ['make', 'manufacturer'] },
            { value: 'category', label: 'Category', aliases: ['type'] },
            { value: 'serial', label: 'Serial number', aliases: ['sn', 'serial_no'] },
            { value: 'model', label: 'Model' },
            { value: 'location', label: 'Location', aliases: ['site', 'branch'] },
          ]}
          onImport={(rows) => {
            items.replace([
              ...rows.map((r) =>
                form.fromValues({
                  ...form.blank,
                  name: r.name || r.serial || 'Imported item',
                  model: '',
                  purchased: '',
                  warrantyUntil: '',
                  ...r,
                }),
              ),
              ...items.items,
            ])
            toast.success(`${rows.length} items imported`)
          }}
        />
      </ResourceListPage>
    )
  }

  if (view === 'brands') {
    const brand = editing ? brands.items.find((b) => b.id === editing) : undefined
    const count = (name: string) => items.items.filter((i) => i.brand === name).length
    return (
      <ResourceListPage
        sidebar={sidebar}
        icon="knowledge"
        title="Brands"
        rows={brands.items}
        getId={(b) => b.id}
        searchText={(b) => `${b.name} ${b.categories.join(' ')}`}
        onRowClick={(b) => setEditing(b.id)}
        actions={
          <Button leadingIcon="plus" onClick={() => setEditing(null)}>
            Add brand
          </Button>
        }
        columns={[
          {
            key: 'name',
            label: 'Brand',
            sort: (b) => b.name,
            render: (b) => (
              <span className="flex items-center gap-2">
                <Avatar name={b.name} size="xs" aria-hidden />
                {b.name}
              </span>
            ),
          },
          {
            key: 'items',
            label: 'Items',
            className: 'w-24',
            sort: (b) => count(b.name),
            render: (b) => <span className="tabular-nums">{count(b.name)}</span>,
          },
          {
            key: 'categories',
            label: 'Categories',
            className: 'w-72',
            render: (b) =>
              b.categories.length ? (
                <span className="flex flex-wrap gap-1">
                  {b.categories.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </span>
              ) : (
                '—'
              ),
          },
          {
            key: 'updated',
            label: 'Updated',
            className: 'w-28',
            render: (b) => <span className="text-muted-foreground">{b.updated}</span>,
          },
        ]}
      >
        <RecordSheet
          {...close}
          title={brand ? 'Edit brand' : 'Add brand'}
          description={brand ? `${count(brand.name)} items use this brand` : undefined}
          saveLabel={brand ? 'Save brand' : 'Add brand'}
          initial={brand}
          fields={[
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
              validate: (v) =>
                brands.items.some(
                  (b) =>
                    b.name.toLowerCase() === String(v).trim().toLowerCase() && b.id !== brand?.id,
                )
                  ? 'That brand already exists'
                  : undefined,
            },
            {
              name: 'categories',
              label: 'Categories',
              type: 'tags',
              options: categories.items.map((c) => c.name),
            },
            {
              name: 'website',
              label: 'Website',
              type: 'text',
              half: true,
              placeholder: 'epson.com',
            },
            { name: 'supportPhone', label: 'Support phone', type: 'text', half: true },
          ]}
          onDelete={
            brand
              ? () => {
                  if (count(brand.name))
                    return toast.error(
                      `${brand.name} is used by ${count(brand.name)} items — move them first`,
                    )
                  brands.remove(brand.id)
                  toast.success(`Deleted ${brand.name}`)
                }
              : undefined
          }
          onSave={(v) => {
            const next = {
              id: brand?.id ?? newId('b'),
              name: String(v.name),
              categories: v.categories as string[],
              website: String(v.website),
              supportPhone: String(v.supportPhone),
              updated: 'Just now',
            }
            if (brand && brand.name !== next.name)
              items.replace(
                items.items.map((i) => (i.brand === brand.name ? { ...i, brand: next.name } : i)),
              )
            brands.upsert(next)
            toast.success(brand ? `Saved ${next.name}` : `${next.name} added`)
          }}
        />
      </ResourceListPage>
    )
  }

  if (view === 'categories') {
    const cat = editing ? categories.items.find((c) => c.id === editing) : undefined
    const count = (name: string) => items.items.filter((i) => i.category === name).length
    return (
      <ResourceListPage
        sidebar={sidebar}
        icon="customers"
        title="Categories"
        rows={categories.items}
        getId={(c) => c.id}
        searchText={(c) => `${c.name} ${c.description}`}
        onRowClick={(c) => setEditing(c.id)}
        actions={
          <Button leadingIcon="plus" onClick={() => setEditing(null)}>
            Add category
          </Button>
        }
        columns={[
          {
            key: 'name',
            label: 'Category',
            className: 'w-56',
            sort: (c) => c.name,
            render: (c) => c.name,
          },
          {
            key: 'description',
            label: 'Description',
            render: (c) => <span className="text-muted-foreground">{c.description || '—'}</span>,
          },
          {
            key: 'items',
            label: 'Items',
            className: 'w-24',
            sort: (c) => count(c.name),
            render: (c) => <span className="tabular-nums">{count(c.name)}</span>,
          },
          {
            key: 'reminder',
            label: 'Warranty reminder',
            className: 'w-44',
            render: (c) => `${c.reminderMonths} months before`,
          },
        ]}
      >
        <RecordSheet
          {...close}
          title={cat ? 'Edit category' : 'Add category'}
          saveLabel={cat ? 'Save category' : 'Add category'}
          initial={
            cat ? { ...cat, reminderMonths: String(cat.reminderMonths) } : { reminderMonths: '2' }
          }
          fields={[
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
              validate: (v) =>
                categories.items.some(
                  (c) =>
                    c.name.toLowerCase() === String(v).trim().toLowerCase() && c.id !== cat?.id,
                )
                  ? 'That category already exists'
                  : undefined,
            },
            { name: 'description', label: 'Description', type: 'textarea', rows: 2 },
            {
              name: 'reminderMonths',
              label: 'Warranty reminder',
              type: 'select',
              helper: 'Months before a warranty ends',
              options: ['1', '2', '3', '6'],
            },
          ]}
          onDelete={
            cat
              ? () => {
                  if (count(cat.name))
                    return toast.error(
                      `${count(cat.name)} items are in ${cat.name} — move them first`,
                    )
                  categories.remove(cat.id)
                  toast.success(`Deleted ${cat.name}`)
                }
              : undefined
          }
          onSave={(v) => {
            const next = {
              id: cat?.id ?? newId('c'),
              name: String(v.name),
              description: String(v.description),
              reminderMonths: Number(v.reminderMonths),
            }
            if (cat && cat.name !== next.name)
              items.replace(
                items.items.map((i) =>
                  i.category === cat.name ? { ...i, category: next.name } : i,
                ),
              )
            categories.upsert(next)
            toast.success(cat ? `Saved ${next.name}` : `${next.name} added`)
          }}
        />
      </ResourceListPage>
    )
  }

  if (view === 'locations') {
    const loc = editing ? locations.items.find((l) => l.id === editing) : undefined
    const count = (name: string) => items.items.filter((i) => i.location === name).length
    return (
      <ResourceListPage
        sidebar={sidebar}
        icon="inventory"
        title="Locations"
        rows={locations.items}
        getId={(l) => l.id}
        searchText={(l) => `${l.name} ${l.address} ${l.contact}`}
        onRowClick={(l) => setEditing(l.id)}
        actions={
          <Button leadingIcon="plus" onClick={() => setEditing(null)}>
            Add location
          </Button>
        }
        columns={[
          {
            key: 'name',
            label: 'Location',
            className: 'w-48',
            sort: (l) => l.name,
            render: (l) => l.name,
          },
          {
            key: 'address',
            label: 'Address',
            render: (l) => <span className="text-muted-foreground">{l.address}</span>,
          },
          {
            key: 'items',
            label: 'Items',
            className: 'w-24',
            sort: (l) => count(l.name),
            render: (l) => <span className="tabular-nums">{count(l.name)}</span>,
          },
          {
            key: 'contact',
            label: 'Contact',
            className: 'w-44',
            render: (l) => <PersonCell name={l.contact} />,
          },
        ]}
      >
        <RecordSheet
          {...close}
          title={loc ? 'Edit location' : 'Add location'}
          saveLabel={loc ? 'Save location' : 'Add location'}
          initial={loc}
          fields={[
            {
              name: 'name',
              label: 'Name',
              type: 'text',
              required: true,
              validate: (v) =>
                locations.items.some(
                  (l) =>
                    l.name.toLowerCase() === String(v).trim().toLowerCase() && l.id !== loc?.id,
                )
                  ? 'That location already exists'
                  : undefined,
            },
            { name: 'address', label: 'Address', type: 'textarea', rows: 2 },
            {
              name: 'contact',
              label: 'Contact',
              type: 'select',
              options: ['Team Lead', 'Tharsi K.', 'Nimal P.', 'Dilini F.', 'Arun M.', 'Kavya S.'],
            },
          ]}
          onDelete={
            loc
              ? () => {
                  if (count(loc.name))
                    return toast.error(
                      `${count(loc.name)} items are at ${loc.name} — move them first`,
                    )
                  locations.remove(loc.id)
                  toast.success(`Deleted ${loc.name}`)
                }
              : undefined
          }
          onSave={(v) => {
            const next = {
              id: loc?.id ?? newId('l'),
              name: String(v.name),
              address: String(v.address),
              contact: String(v.contact),
            }
            if (loc && loc.name !== next.name)
              items.replace(
                items.items.map((i) =>
                  i.location === loc.name ? { ...i, location: next.name } : i,
                ),
              )
            locations.upsert(next)
            toast.success(loc ? `Saved ${next.name}` : `${next.name} added`)
          }}
        />
      </ResourceListPage>
    )
  }
  return null
}

/** /inventory/items/:id — item details (Figma I2), edit, delete confirmation (I10). */
export function ItemRoute({ id }: { id: string }) {
  const navigate = useNavigate()
  const form = useItemForm()
  const { tickets, newTicket } = useWorkspace()
  const { records } = useCustomers()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const item = form.items.items.find((i) => i.id === id)
  if (!item) return <Navigate to="/inventory/items" replace />
  const record = records.find((r) => r.customer.id === item.customerId)
  return (
    <ItemDetailPage
      key={item.id}
      sidebar={<AppSidebar />}
      item={item}
      customer={record && { ...record.customer, company: record.profile.company }}
      tickets={item.customerId ? tickets.filter((t) => t.requester.id === item.customerId) : []}
      onBack={() => navigate('/inventory/items')}
      onEdit={() => setEditing(true)}
      onDelete={() => setDeleting(true)}
      onNewTicket={() => newTicket(item.customerId)}
      onOpenTicket={(tid) => navigate(ticketPath('all', tid))}
      onOpenCustomer={record ? () => navigate(`/customers/all/${record.customer.id}`) : undefined}
    >
      <RecordSheet
        key={editing ? 'edit' : 'closed'}
        open={editing}
        onOpenChange={setEditing}
        title="Edit item"
        saveLabel="Save changes"
        fields={form.fields(item.id)}
        initial={form.toValues(item)}
        onSave={(v) => {
          form.items.upsert(form.fromValues(v, item))
          toast.success(`Saved ${String(v.name)}`)
        }}
      />
      <ConfirmationModal
        open={deleting}
        onOpenChange={setDeleting}
        variant="destructive"
        title={`Delete ${item.name}?`}
        description={`${item.serial} comes off ${record ? `${record.customer.name}’s profile` : 'the inventory'} and its history is removed. Tickets stay. This can’t be undone.`}
        confirmLabel="Delete item"
        onConfirm={() => {
          form.items.remove(item.id)
          toast.success(`Deleted ${item.name}`)
          navigate('/inventory/items')
        }}
      />
    </ItemDetailPage>
  )
}
