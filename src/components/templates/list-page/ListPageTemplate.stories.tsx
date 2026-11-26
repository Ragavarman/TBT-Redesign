import type { Meta, StoryObj } from '@storybook/react-vite'
import { MockSidebar, SlotBox } from '@/stories/shell'
import { ListPageTemplate } from './ListPageTemplate'

const meta = {
  title: 'Templates/ListPage',
  component: ListPageTemplate,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    sidebar: { control: false },
    header: { control: false },
    toolbar: { control: false },
    children: { control: false },
    footer: { control: false },
    aside: { control: false },
  },
} satisfies Meta<typeof ListPageTemplate>

export default meta
type Story = StoryObj<typeof meta>

const header = <SlotBox name="header" hint="PageHeader · 64" className="m-2" />

/** Every slot filled: header · toolbar · list · footer. */
export const Slots: Story = {
  args: {
    sidebar: <MockSidebar active="all" />,
    header,
    toolbar: (
      <SlotBox
        name="toolbar"
        hint="status tabs 41 · notice 57 · BulkActionBar 56"
        className="m-2"
      />
    ),
    children: (
      <SlotBox
        name="children"
        hint="DataTable / rows — full bleed, scrolls"
        className="m-2 h-[calc(100%-1rem)]"
      />
    ),
    footer: <SlotBox name="footer" hint="Pagination" className="w-full" />,
  },
}

/** With a preview panel on the right. */
export const WithAside: Story = {
  args: {
    ...Slots.args,
    aside: <SlotBox name="aside" hint="360" className="m-2 h-full" />,
  },
}
