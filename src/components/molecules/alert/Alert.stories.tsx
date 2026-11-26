import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '@/components/atoms'
import { Alert } from './Alert'

const VARIANTS = ['neutral', 'info', 'success', 'warning', 'destructive'] as const

const meta = {
  title: 'Molecules/Alert',
  component: Alert,
  args: {
    variant: 'warning',
    title: 'SLA at risk',
    description: 'First response is due in 25 minutes. Reply or reassign to keep the SLA.',
  },
  argTypes: { variant: { control: 'select', options: VARIANTS } },
  parameters: { layout: 'padded' },
  decorators: [(Story) => <div className="w-[30rem]">{Story()}</div>],
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    action: (
      <Button variant="outline" size="sm">
        Reply
      </Button>
    ),
    onDismiss: fn(),
  },
}

/** All variants — Figma 09 · Alert. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {VARIANTS.map((v) => (
        <Alert
          key={v}
          variant={v}
          title="SLA at risk"
          description="First response is due in 25 minutes. Reply or reassign to keep the SLA."
          action={
            <Button variant="outline" size="sm">
              Reply
            </Button>
          }
          onDismiss={() => {}}
        />
      ))}
    </div>
  ),
}

export const TitleOnly: Story = {
  args: {
    variant: 'success',
    title: 'Saved. Changes apply to new tickets.',
    description: undefined,
  },
}
