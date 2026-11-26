import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { FilterChips, type FilterChipOption } from './FilterChips'

const options: FilterChipOption[] = [
  { value: 'all', label: 'All' },
  { value: 'messages', label: 'Messages' },
  { value: 'notes', label: 'Notes' },
  { value: 'status', label: 'Status' },
  { value: 'calls', label: 'Calls' },
]

const meta = {
  title: 'Organisms/FilterChips',
  component: FilterChips,
  parameters: { layout: 'padded' },
  args: { options, value: 'all', label: 'Filter timeline', onValueChange: () => {} },
  argTypes: { options: { control: false } },
  render: function Render(args) {
    const [value, setValue] = useState(args.value)
    return <FilterChips {...args} value={value} onValueChange={setValue} />
  },
} satisfies Meta<typeof FilterChips>

export default meta
type Story = StoryObj<typeof meta>

/** Ticket timeline filter. Clicking the selected chip keeps it selected. */
export const Timeline: Story = {}

/** Chips with counts. */
export const WithCounts: Story = {
  args: {
    options: [
      { value: 'all', label: 'All', count: 12 },
      { value: 'messages', label: 'Messages', count: 5 },
      { value: 'notes', label: 'Notes', count: 2 },
      { value: 'status', label: 'Status', count: 4 },
      { value: 'calls', label: 'Calls', count: 1 },
    ],
  },
}
