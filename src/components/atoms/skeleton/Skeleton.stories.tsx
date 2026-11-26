import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Atoms/Skeleton',
  component: Skeleton,
  args: { shape: 'line', className: 'w-60' },
  argTypes: { shape: { control: 'inline-radio', options: ['line', 'circle', 'block'] } },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** The five Figma 09 · Skeleton types, composed from lines, circles and blocks. */
export const Types: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">line</span>
        <Skeleton className="w-60" />
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">circle</span>
        <Skeleton shape="circle" />
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">row</span>
        <div className="flex items-center gap-3">
          <Skeleton shape="circle" />
          <div className="flex flex-col gap-2">
            <Skeleton className="w-50" />
            <Skeleton className="h-2.5 w-35" />
          </div>
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">card</span>
        <div className="flex w-48 flex-col gap-3 rounded-xl border bg-card p-4">
          <Skeleton className="w-30" />
          <Skeleton shape="block" className="h-7 w-20" />
          <Skeleton className="h-2.5 w-40" />
        </div>
      </section>
      <section className="flex flex-col gap-2">
        <span className="text-caption text-muted-foreground">table-row</span>
        <div className="flex w-[35rem] items-center gap-6 border-b px-3 py-3.5">
          <Skeleton shape="block" className="size-4" />
          <Skeleton className="w-45" />
          <Skeleton shape="circle" className="size-5" />
          <Skeleton className="w-22" />
          <Skeleton className="w-15" />
          <Skeleton className="w-12" />
        </div>
      </section>
    </div>
  ),
}
