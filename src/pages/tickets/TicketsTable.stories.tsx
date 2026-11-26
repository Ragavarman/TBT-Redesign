import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { toast, Toaster } from '@/components/molecules'
import { MockSidebar } from '@/stories/shell'
import { TicketsTablePage } from './TicketsTablePage'

const meta = {
  title: 'Pages/Tickets/Table view',
  component: TicketsTablePage,
  parameters: { layout: 'fullscreen' },
  args: { sidebar: <MockSidebar active="all" /> },
  argTypes: { sidebar: { control: false } },
  // bulk actions confirm with a toast (Undo)
  decorators: [
    (Story) => (
      <>
        {Story()}
        <Toaster />
      </>
    ),
  ],
} satisfies Meta<typeof TicketsTablePage>

export default meta
type Story = StoryObj<typeof meta>

/** As in Figma: three rows selected, so the bulk-action strip is showing. Close / Assign / Change status work. */
export const ThreeSelected: Story = {
  args: { initialSelection: { '222': true, '221': true, '220': true } },
}

/** Nothing selected — the strip hides and the table moves up under the header. */
export const Default: Story = {}

function UndoToast() {
  useEffect(() => {
    const id = toast.success('3 tickets closed', {
      action: { label: 'Undo', onClick: () => {} },
      duration: Infinity,
    })
    return () => {
      toast.dismiss(id)
    }
  }, [])
  return null
}

/** Figma X12 · after a bulk action: the toast offers Undo (it puts the old values back). */
export const BulkActionDone: Story = {
  decorators: [
    (Story) => (
      <>
        {Story()}
        <UndoToast />
      </>
    ),
  ],
}
