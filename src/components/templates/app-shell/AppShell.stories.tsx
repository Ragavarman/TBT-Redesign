import type { Meta, StoryObj } from '@storybook/react-vite'
import { MockSidebar, SlotBox } from '@/stories/shell'
import { AppShell, Panel, PanelBody } from './AppShell'

const meta = {
  title: 'Templates/AppShell',
  component: AppShell,
  parameters: { layout: 'fullscreen' },
  argTypes: { sidebar: { control: false }, children: { control: false } },
} satisfies Meta<typeof AppShell>

export default meta
type Story = StoryObj<typeof meta>

/** The frame every screen sits in: sidebar + one panel filling the rest. */
export const OnePanel: Story = {
  args: {
    sidebar: <MockSidebar />,
    children: (
      <Panel>
        <SlotBox name="Panel header" hint="PageHeader · 64" className="m-2" />
        <PanelBody className="p-2">
          <SlotBox name="PanelBody" hint="scrolls" className="h-full" />
        </PanelBody>
      </Panel>
    ),
  },
}

/** Three panels: fixed 320 · fluid · fixed 300 (plain column of cards). Sidebar collapsed. */
export const ThreePanels: Story = {
  args: {
    sidebar: <MockSidebar collapsed />,
    children: (
      <>
        <Panel width={320} className="p-2">
          <SlotBox name="Panel width={320}" className="h-full" />
        </Panel>
        <Panel className="p-2">
          <SlotBox name="Panel" hint="flex-1" className="h-full" />
        </Panel>
        <Panel width={300} surface="plain">
          <div className="rounded-xl border bg-card p-2">
            <SlotBox name='surface="plain"' hint="card 1" className="h-60" />
          </div>
          <div className="rounded-xl border bg-card p-2">
            <SlotBox name="card 2" className="h-40" />
          </div>
        </Panel>
      </>
    ),
  },
}
