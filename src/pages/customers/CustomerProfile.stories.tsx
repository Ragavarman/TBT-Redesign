import type { Meta, StoryObj } from '@storybook/react-vite'
import { wsCustomerProfile, wsCustomers, wsTickets } from '@/mocks'
import { MockSidebar } from '@/stories/shell'
import { CustomerProfilePage } from './CustomerProfilePage'

const dennis = wsCustomers.dennis

const meta = {
  title: 'Pages/Customers/Profile',
  component: CustomerProfilePage,
  parameters: { layout: 'fullscreen' },
  args: {
    sidebar: <MockSidebar module="customers" active="all" />,
    customer: dennis,
    profile: wsCustomerProfile(dennis.id)!,
    tickets: wsTickets.filter((t) => t.requester.id === dennis.id),
    onBack: () => {},
    onOpenTicket: () => {},
    onNewTicket: () => {},
  },
  argTypes: {
    sidebar: { control: false },
    customer: { control: false },
    profile: { control: false },
    tickets: { control: false },
  },
} satisfies Meta<typeof CustomerProfilePage>

export default meta
type Story = StoryObj<typeof meta>

/** Figma 05b · Tickets tab (1). */
export const Tickets: Story = {}

/** Figma C1 · Notes tab (2 or N): add, pin, delete with undo. */
export const Notes: Story = { args: { initialTab: 'notes' } }

/** Figma C2 · Assets tab (3): Link asset from inventory. */
export const Assets: Story = { args: { initialTab: 'assets' } }

/** Figma X14 · Calls tab (4): recordings play, Call back. */
export const Calls: Story = { args: { initialTab: 'calls' } }

/** A customer with a generated profile: empty notes, assets and calls. */
export const NewCustomer: Story = {
  args: {
    customer: wsCustomers.northwind,
    profile: wsCustomerProfile(wsCustomers.northwind.id)!,
    tickets: wsTickets.filter((t) => t.requester.id === wsCustomers.northwind.id),
    initialTab: 'notes',
  },
}
