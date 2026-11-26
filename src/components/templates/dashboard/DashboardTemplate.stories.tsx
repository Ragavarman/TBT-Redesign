import type { Meta, StoryObj } from '@storybook/react-vite'
import { MockSidebar, SlotBox } from '@/stories/shell'
import { DashboardRow, DashboardTemplate } from './DashboardTemplate'

const meta = {
  title: 'Templates/Dashboard',
  component: DashboardTemplate,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    sidebar: { control: false },
    header: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof DashboardTemplate>

export default meta
type Story = StoryObj<typeof meta>

/** Reports overview layout: header · KPI strip · charts row (694 : 360) · table card. */
export const Slots: Story = {
  args: {
    sidebar: <MockSidebar module="reports" />,
    header: (
      <SlotBox name="header" hint="PageHeader · date range, filters, export" className="m-2" />
    ),
    children: (
      <>
        <SlotBox name="KpiStrip" hint="130" className="h-32 shrink-0" />
        <DashboardRow>
          <SlotBox name="ChartCard" hint="flex-[694]" className="h-88 flex-[694]" />
          <SlotBox name="ChartCard" hint="flex-[360]" className="h-88 flex-[360]" />
        </DashboardRow>
        <SlotBox name="Table card" hint="Agents" className="h-56 shrink-0" />
      </>
    ),
  },
}
