import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumb } from './Breadcrumb'

const meta = {
  title: 'Molecules/Breadcrumb',
  component: Breadcrumb,
  args: {
    items: [
      { label: 'Inventory', href: '#' },
      { label: 'Printers', href: '#' },
      { label: 'HP LaserJet 4' },
    ],
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const ThreeLevels: Story = {}

export const TwoLevels: Story = {
  args: { items: [{ label: 'Items', href: '#' }, { label: 'Printer on floor 3' }] },
}

/** More than `maxItems` levels: the middle collapses into a “…” menu (Figma levels=collapsed). */
export const Collapsed: Story = {
  args: {
    items: [
      { label: 'Knowledge', href: '#' },
      { label: 'IT', href: '#' },
      { label: 'Hardware', href: '#' },
      { label: 'Printers', href: '#' },
      { label: 'Troubleshooting' },
    ],
  },
}

/** Levels side by side — Figma 07 · Breadcrumbs. */
export const AllLevels: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Breadcrumb items={[{ label: 'Items', href: '#' }, { label: 'Printer on floor 3' }]} />
      <Breadcrumb
        items={[
          { label: 'Tickets', href: '#' },
          { label: 'Hardware', href: '#' },
          { label: '#4821' },
        ]}
      />
      <Breadcrumb
        items={[
          { label: 'Knowledge', href: '#' },
          { label: 'IT', href: '#' },
          { label: 'Hardware', href: '#' },
          { label: 'Printers', href: '#' },
          { label: 'Troubleshooting' },
        ]}
      />
    </div>
  ),
}
