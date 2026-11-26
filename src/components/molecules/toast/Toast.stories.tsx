import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '@/components/atoms'
import { Toaster } from './Toaster'
import { toast } from './index'

const meta = {
  title: 'Molecules/Toast',
  component: Toaster,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

/** Click to fire each type. */
export const Playground: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2 p-8">
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast.success('Ticket #1042 closed', {
            description: 'Kavin S. will be notified.',
            action: { label: 'Undo', onClick: () => toast.info('Ticket reopened') },
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error('Couldn’t send reply', {
            description: 'Check your connection and try again.',
            action: { label: 'Retry', onClick: () => {} },
          })
        }
      >
        Error
      </Button>
      <Button variant="outline" onClick={() => toast.info('3 new tickets in Unassigned')}>
        Info
      </Button>
      <Button variant="outline" onClick={() => toast.warning('SLA breach in 10 minutes')}>
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((r) => setTimeout(r, 1500)), {
            loading: 'Sending reply…',
            success: 'Reply sent',
            error: 'Couldn’t send reply',
          })
        }
      >
        Promise
      </Button>
    </div>
  ),
}

function FireAll() {
  useEffect(() => {
    const opts = { duration: Infinity, description: 'Kavin S. will be notified.' }
    toast.success('Ticket #1042 closed', { ...opts, action: { label: 'Undo', onClick: () => {} } })
    toast.error('Couldn’t send reply', { ...opts, action: { label: 'Retry', onClick: () => {} } })
    toast.info('Ticket #1042 closed', opts)
    toast.warning('Ticket #1042 closed', opts)
    toast.loading('Sending reply…', opts)
    return () => {
      toast.dismiss()
    }
  }, [])
  return null
}

/** All five types — Figma 09 · Toast (shown expanded). */
export const Types: Story = {
  render: () => (
    <div className="h-[28rem]">
      <Toaster expand visibleToasts={5} />
      <FireAll />
    </div>
  ),
}
