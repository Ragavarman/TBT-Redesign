import type { Meta, StoryObj } from '@storybook/react-vite'
import { wsCompanies, wsCustomerProfile, wsCustomers, wsDuplicates, wsTagDefs } from '@/mocks'
import { MockSidebar } from '@/stories/shell'
import { CompaniesPage } from './CompaniesPage'
import { DuplicatesPage } from './DuplicatesPage'
import { TagsPage } from './TagsPage'

/** Customers › Needs review (Figma C4), Tags (C5) and Companies (X15). */
const meta = {
  title: 'Pages/Customers/Review, tags, companies',
  component: DuplicatesPage,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DuplicatesPage>

export default meta
type Story = StoryObj<typeof meta>

const byId = Object.fromEntries(Object.values(wsCustomers).map((c) => [c.id, c]))

/** Figma C4 · pick the value to keep per field, then Merge or Not a duplicate. J / K move. */
export const ReviewDuplicates: Story = {
  args: {
    sidebar: <MockSidebar module="customers" active="review" />,
    groups: wsDuplicates.map((g) => ({
      id: g.id,
      a: { customer: byId[g.customerId]!, profile: wsCustomerProfile(g.customerId)!, tickets: 1 },
      b: g.other,
    })),
    onMerge: () => {},
    onDismiss: () => {},
    onOpenCustomer: () => {},
  },
}

/** Nothing left to review. */
export const NothingToReview: Story = {
  args: { ...ReviewDuplicates.args!, groups: [] } as Story['args'],
}

/** Figma C5 · Edit tag over the Tags list. */
export const EditTag: StoryObj<typeof TagsPage> = {
  render: () => (
    <TagsPage
      sidebar={<MockSidebar module="customers" active="tags" />}
      tags={wsTagDefs}
      usage={{
        VIP: 4,
        'Frequent caller': 23,
        Wholesale: 3,
        'Needs callback': 2,
        'Zendesk import': 184,
        Pharmacy: 1,
      }}
      onSave={() => {}}
      onDelete={() => {}}
      initialEditId="tg2"
    />
  ),
}

/** Figma X15 · Companies: Filter (open tickets, applications), Add company, row → its customers. */
export const Companies: StoryObj<typeof CompaniesPage> = {
  render: () => (
    <CompaniesPage
      sidebar={<MockSidebar module="customers" active="companies" />}
      companies={wsCompanies.map((c, i) => ({
        ...c,
        openTickets: [2, 3, 2, 2, 2, 1, 0, 1, 0][i] ?? 0,
      }))}
      applications={['Customer Portal', 'POS', 'Inventory', 'Payments']}
      onOpenCompany={() => {}}
      onAddCompany={() => {}}
    />
  ),
}
