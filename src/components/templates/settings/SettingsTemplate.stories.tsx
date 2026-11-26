import type { Meta, StoryObj } from '@storybook/react-vite'
import { MockSidebar, SlotBox } from '@/stories/shell'
import { SettingsTemplate } from './SettingsTemplate'

const meta = {
  title: 'Templates/Settings',
  component: SettingsTemplate,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    sidebar: { control: false },
    header: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof SettingsTemplate>

export default meta
type Story = StoryObj<typeof meta>

/** Header over a centred 760px column of SettingsSections. */
export const Slots: Story = {
  args: {
    sidebar: <MockSidebar module="settings" active="profile" />,
    header: <SlotBox name="header" hint="PageHeader · Save changes" className="m-2" />,
    title: 'Profile',
    description: 'How you appear to customers and teammates.',
    children: (
      <>
        <SlotBox name="SettingsSection" hint="Photo & name" className="h-68" />
        <SlotBox name="SettingsSection" hint="Preferences" className="h-32" />
        <SlotBox name="SettingsSection" hint="Email signature" className="h-40" />
      </>
    ),
  },
}
