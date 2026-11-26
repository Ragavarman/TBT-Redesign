import type { Meta, StoryObj } from '@storybook/react-vite'
import { wsTickets } from '@/mocks'
import { MockSidebar } from '@/stories/shell'
import { ReportsOverviewPage } from './ReportsOverviewPage'

const meta = {
  title: 'Pages/Reports/Overview',
  component: ReportsOverviewPage,
  parameters: { layout: 'fullscreen' },
  args: { sidebar: <MockSidebar module="reports" active="overview" />, tickets: wsTickets },
  argTypes: { sidebar: { control: false }, tickets: { control: false } },
} satisfies Meta<typeof ReportsOverviewPage>

export default meta
type Story = StoryObj<typeof meta>

/** Figma X18 · Overview for Nov 11 – 18 (Figma's exact volume). */
export const Overview: Story = {}

/** Figma X18 · date range picker open: presets, range on the calendar, compare. */
export const DateRangePicker: Story = { args: { pickerOpen: true } }

/** Last 30 days — volume is generated per day. */
export const Last30Days: Story = {
  args: { initialRange: { start: '2026-10-27', end: '2026-11-25' } },
}

/** This quarter — beyond 31 days the chart switches to weekly bars. */
export const ThisQuarter: Story = {
  args: { initialRange: { start: '2026-10-01', end: '2026-11-25' } },
}
