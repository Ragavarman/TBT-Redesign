import type { Meta, StoryObj } from '@storybook/react-vite'
import { Heading, Text } from './Text'

const VARIANTS = [
  'display',
  'heading-1',
  'heading-2',
  'title',
  'body-strong',
  'body',
  'small',
  'label',
  'caption',
  'overline',
] as const
const TONES = ['default', 'muted', 'primary', 'success', 'warning', 'info', 'destructive'] as const

const meta = {
  title: 'Atoms/Text',
  component: Text,
  args: { children: 'The quick brown fox resolves the ticket', variant: 'body', tone: 'default' },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    tone: { control: 'select', options: ['inherit', ...TONES] },
  },
} satisfies Meta<typeof Text>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-3">
      {VARIANTS.map((v) => (
        <div key={v} className="grid grid-cols-[8rem_1fr] items-baseline gap-4">
          <Text variant="caption" tone="muted">
            {v}
          </Text>
          <Text variant={v}>The quick brown fox resolves the ticket</Text>
        </div>
      ))}
    </div>
  ),
}

export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      {TONES.map((t) => (
        <Text key={t} tone={t}>
          {t}
        </Text>
      ))}
    </div>
  ),
}

/** `level` sets the element (h1–h6); `variant` sets the look. */
export const Headings: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Heading level={1} variant="display">
        Inbox
      </Heading>
      <Heading level={2} variant="heading-1">
        Assigned to me
      </Heading>
      <Heading level={3}>Today</Heading>
      <Heading level={4} variant="title">
        Printer on floor 3 is offline
      </Heading>
    </div>
  ),
}

export const Truncate: Story = {
  render: () => (
    <div className="w-60 rounded-md border p-3">
      <Text truncate>
        Reported by Dana via email — the printer stopped responding after the update.
      </Text>
    </div>
  ),
}
