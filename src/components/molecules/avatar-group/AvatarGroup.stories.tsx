import type { Meta, StoryObj } from '@storybook/react-vite'
import { AvatarGroup } from './AvatarGroup'

const PEOPLE = [
  { name: 'Tara Lane' },
  { name: 'Amir Malik' },
  { name: 'Nia Park' },
  { name: 'Kavin S' },
  { name: 'Dana Whitfield' },
]

const meta = {
  title: 'Molecules/AvatarGroup',
  component: AvatarGroup,
  args: { people: PEOPLE, max: 3, size: 'sm' },
  argTypes: { size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg'] } },
} satisfies Meta<typeof AvatarGroup>

export default meta
type Story = StoryObj<typeof meta>

/** Figma 08 · Avatar group — three avatars and “+2”. */
export const Default: Story = {}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['xs', 'sm', 'md', 'lg'] as const).map((s) => (
        <AvatarGroup key={s} people={PEOPLE} size={s} />
      ))}
    </div>
  ),
}
