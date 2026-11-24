import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '@/components/atoms'
import { Toaster, toast } from '@/components/molecules'
import { ticket, tickets } from '@/mocks'
import { ConfirmationModal } from './ConfirmationModal'

const meta = {
  title: 'Organisms/ConfirmationModal',
  component: ConfirmationModal,
  args: {
    variant: 'default',
    title: `Close ticket #${ticket.id}?`,
    description: 'The requester will get a resolution email and can reply to reopen it.',
    confirmLabel: 'Close ticket',
    onConfirm: fn(),
  },
  argTypes: { variant: { control: 'inline-radio', options: ['default', 'destructive'] } },
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ConfirmationModal>

export default meta
type Story = StoryObj<typeof meta>

/** Figma 09 · Confirmation modal, variant=default. */
export const Default: Story = { args: { defaultOpen: true } }

/** Figma 09 · Confirmation modal, variant=destructive. */
export const Destructive: Story = {
  args: {
    defaultOpen: true,
    variant: 'destructive',
    title: 'Delete 3 tickets?',
    description:
      'This permanently removes the tickets and their conversation history. This can’t be undone.',
    confirmLabel: 'Delete',
  },
}

const selected = tickets.slice(0, 3)

/**
 * Figma 09 · Dialog in context — async confirm: the button shows a spinner while the
 * (mock) request runs, then the modal closes and a toast confirms.
 */
export const InContext: Story = {
  render: () => (
    <div className="p-8">
      <Toaster />
      <ConfirmationModal
        variant="destructive"
        title={`Delete ${selected.length} tickets?`}
        description={`${selected.map((t) => `#${t.id}`).join(', ')} and their conversation history will be removed. This can’t be undone.`}
        confirmLabel="Delete"
        trigger={
          <Button variant="destructive" leadingIcon="trash">
            Delete {selected.length} tickets
          </Button>
        }
        onConfirm={() =>
          new Promise<void>((resolve) =>
            setTimeout(() => {
              resolve()
              toast.success(`${selected.length} tickets deleted`, {
                action: { label: 'Undo', onClick: () => toast.info('Tickets restored') },
              })
            }, 1200),
          )
        }
      />
    </div>
  ),
}
