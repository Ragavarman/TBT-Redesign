import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/atoms'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'Molecules/EmptyState',
  component: EmptyState,
  args: {
    type: 'empty',
    title: 'No tickets yet',
    description: 'New conversations from email, chat and the portal land here.',
  },
  argTypes: {
    type: { control: 'select', options: ['empty', 'no-results', 'error', 'no-access', 'offline'] },
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  args: {
    action: (
      <Button size="sm" leadingIcon="plus">
        New ticket
      </Button>
    ),
  },
}

/** The five types — Figma 09 · Empty state. */
export const Types: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid grid-cols-5 gap-4">
      <EmptyState
        type="empty"
        title="No tickets yet"
        description="New conversations from email, chat and the portal land here."
        action={
          <Button size="sm" leadingIcon="plus">
            New ticket
          </Button>
        }
      />
      <EmptyState
        type="no-results"
        title="No results found"
        description="Try a different keyword or clear some filters."
        action={
          <Button size="sm" variant="outline">
            Clear filters
          </Button>
        }
      />
      <EmptyState
        type="error"
        title="Something went wrong"
        description="We couldn’t load this view. Your data is safe."
        action={
          <Button size="sm" variant="outline">
            Retry
          </Button>
        }
      />
      <EmptyState
        type="no-access"
        title="You don’t have access"
        description="Ask a workspace admin to give you the Agent role."
        action={
          <Button size="sm" variant="outline">
            Request access
          </Button>
        }
      />
      <EmptyState
        type="offline"
        title="You’re offline"
        description="Changes will sync when you reconnect."
        action={
          <Button size="sm" variant="outline">
            Retry
          </Button>
        }
      />
    </div>
  ),
}
