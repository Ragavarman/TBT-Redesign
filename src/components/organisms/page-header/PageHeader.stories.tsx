import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/atoms'
import { reportRange } from '@/mocks'
import { PageHeader } from './PageHeader'

const meta = {
  title: 'Organisms/PageHeader',
  component: PageHeader,
  parameters: { layout: 'padded' },
  args: { icon: 'inbox', title: 'All tickets', count: 67 },
  decorators: [
    (Story) => (
      <div className="overflow-hidden rounded-xl border bg-card">
        <Story />
      </div>
    ),
  ],
  argTypes: { actions: { control: false }, meta: { control: false } },
} satisfies Meta<typeof PageHeader>

export default meta
type Story = StoryObj<typeof meta>

/** Tickets · Table view: count + Filters / Display / New ticket. */
export const ListPage: Story = {
  args: {
    actions: (
      <>
        <Button variant="ghost" leadingIcon="filter" shortcut="F">
          Filters
        </Button>
        <Button variant="ghost" leadingIcon="display" shortcut="V">
          Display
        </Button>
        <Button leadingIcon="plus">New ticket</Button>
      </>
    ),
  },
}

/** Reports · Overview: date range, team filter, export. */
export const Reports: Story = {
  args: {
    icon: 'reports',
    title: 'Overview',
    count: undefined,
    actions: (
      <>
        <Button variant="secondary" leadingIcon="calendar" trailingIcon="chevron-down">
          {reportRange.label}
        </Button>
        <Button variant="ghost" trailingIcon="chevron-down">
          All teams
        </Button>
        <Button variant="ghost" leadingIcon="download">
          Export
        </Button>
      </>
    ),
  },
}

/** Settings · Profile: one primary action. */
export const Settings: Story = {
  args: {
    icon: 'settings',
    title: 'Profile',
    count: undefined,
    actions: <Button>Save changes</Button>,
  },
}

/** No actions: the header keeps its 64px height. */
export const TitleOnly: Story = { args: { icon: 'customers', title: 'Customers', count: 128 } }
