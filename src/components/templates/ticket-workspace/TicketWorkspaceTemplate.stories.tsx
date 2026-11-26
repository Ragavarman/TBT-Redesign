import type { Meta, StoryObj } from '@storybook/react-vite'
import { MockSidebar, SlotBox } from '@/stories/shell'
import { TicketWorkspaceTemplate } from './TicketWorkspaceTemplate'

const meta = {
  title: 'Templates/TicketWorkspace',
  component: TicketWorkspaceTemplate,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    sidebar: { control: false },
    list: { control: false },
    header: { control: false },
    tabs: { control: false },
    children: { control: false },
    composer: { control: false },
    details: { control: false },
  },
} satisfies Meta<typeof TicketWorkspaceTemplate>

export default meta
type Story = StoryObj<typeof meta>

/** list 320 · conversation · details 300, sidebar collapsed to the rail. */
export const Slots: Story = {
  args: {
    sidebar: <MockSidebar collapsed />,
    list: <SlotBox name="list" hint="320 · header 57 + TicketListItems" className="m-2 h-full" />,
    header: <SlotBox name="header" hint="breadcrumb + subject + actions · 79" className="m-2" />,
    tabs: <SlotBox name="tabs" hint="40" className="m-2" />,
    children: (
      <SlotBox name="children" hint="timeline / conversation — scrolls" className="m-2 h-[60rem]" />
    ),
    composer: (
      <div className="flex justify-center pb-5">
        <SlotBox name="composer" hint="ComposerBar, floating" className="w-[29rem] bg-card" />
      </div>
    ),
    details: (
      <>
        <div className="rounded-xl border bg-card p-2">
          <SlotBox name="details" hint="Ticket details card" className="h-[30rem]" />
        </div>
        <div className="rounded-xl border bg-card p-2">
          <SlotBox name="details" hint="Customer card" className="h-48" />
        </div>
      </>
    ),
  },
}

/** Focused view: no list panel, the sidebar expanded. */
export const WithoutList: Story = {
  args: { ...Slots.args, list: undefined, sidebar: <MockSidebar /> },
}
