import type { Meta, StoryObj } from '@storybook/react-vite'
import { CustomerSheet } from './CustomerSheet'

const meta = {
  title: 'Organisms/CustomerSheet',
  component: CustomerSheet,
  parameters: { layout: 'fullscreen' },
  decorators: [(Story) => <div className="h-dvh bg-background">{Story()}</div>],
  args: {
    open: true,
    onOpenChange: () => {},
    mode: 'edit',
    initial: {
      firstName: 'Dennis',
      lastName: 'Davenport',
      phone: '(909) 802-3652',
      email: 'dennis@davenport.co',
      company: 'Davenport & Co.',
      location: 'Colombo 03',
      tags: ['VIP', 'Frequent caller'],
      notes: 'Prefers a call before 4 PM',
    },
    companies: ['Acme Corp', 'Bluefin', 'Davenport & Co.', 'Northwind'],
    locations: ['Colombo 03', 'Colombo 07', 'Kandy', 'Galle'],
    tags: ['VIP', 'Frequent caller', 'Wholesale', 'Needs callback'],
    onSave: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof CustomerSheet>

export default meta
type Story = StoryObj<typeof meta>

/** Figma C3 · Edit customer, with Delete customer (asks first). */
export const Edit: Story = {}

/** Add customer: empty form; needs a first name and a phone or email. */
export const Add: Story = { args: { mode: 'add', initial: undefined, onDelete: undefined } }
