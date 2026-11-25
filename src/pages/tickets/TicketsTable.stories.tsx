import type { Meta, StoryObj } from '@storybook/react-vite'
import { MockSidebar } from '@/stories/shell'
import { TicketsTablePage } from './TicketsTablePage'

const meta = {
  title: 'Pages/Tickets/Table view',
  component: TicketsTablePage,
  parameters: { layout: 'fullscreen' },
  args: { sidebar: <MockSidebar active="all" /> },
  argTypes: { sidebar: { control: false } },
} satisfies Meta<typeof TicketsTablePage>

export default meta
type Story = StoryObj<typeof meta>

/** As in Figma: three rows selected, so the bulk-action strip is showing. */
export const ThreeSelected: Story = {
  args: { initialSelection: { '222': true, '221': true, '220': true } },
}

/** Nothing selected — the strip hides and the table moves up under the header. */
export const Default: Story = {}
