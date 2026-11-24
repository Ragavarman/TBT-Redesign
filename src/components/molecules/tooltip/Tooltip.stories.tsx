import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, IconButton } from '@/components/atoms'
import { Tooltip } from './Tooltip'

const meta = {
  title: 'Molecules/Tooltip',
  component: Tooltip,
  args: {
    content: 'Assign to me',
    side: 'top',
    children: <IconButton icon="user" label="Assign to me" variant="outline" />,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    shortcut: { control: 'text' },
    children: { control: false },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

/** Hover or focus the button. */
export const Playground: Story = {}

/** side × shortcut — same grid as Figma 09 · Tooltip (forced open). */
export const Sides: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-4 gap-x-28 gap-y-20 p-16">
      {(['top', 'bottom', 'left', 'right'] as const).flatMap((side) =>
        [false, true].map((withKey) => (
          <div key={`${side}-${withKey}`} className="flex justify-center">
            <Tooltip open content="Assign to me" side={side} shortcut={withKey ? 'I' : undefined}>
              <IconButton icon="user" label={`${side} ${withKey}`} variant="outline" />
            </Tooltip>
          </div>
        )),
      )}
    </div>
  ),
}

export const OnButton: Story = {
  render: () => (
    <Tooltip content="Create a ticket" shortcut="C" defaultOpen>
      <Button leadingIcon="plus">New ticket</Button>
    </Tooltip>
  ),
}
