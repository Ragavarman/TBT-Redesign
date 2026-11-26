import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Pagination } from './Pagination'

const meta = {
  title: 'Molecules/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 3, range: '1–25 of 67', appearance: 'bar', onPageChange: fn() },
  argTypes: { appearance: { control: 'inline-radio', options: ['bar', 'inline'] } },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

/** A stand-in table so the footer bar is shown where it lives. */
const inTable: NonNullable<Story['decorators']> = [
  (Story) => (
    <div className="w-[45rem] overflow-hidden rounded-xl border bg-card">
      {[1, 2, 3].map((r) => (
        <div
          key={r}
          className="flex h-11 items-center border-b px-4 text-small text-muted-foreground last:border-b-0"
        >
          Row {r}
        </div>
      ))}
      {Story()}
    </div>
  ),
]

/** Figma 07 · Pagination — footer bar under a table. */
export const TableFooter: Story = { decorators: inTable }

export const Interactive: Story = {
  args: { pageCount: 20 },
  decorators: inTable,
  render: (args) => {
    function Demo() {
      const [page, setPage] = useState(1)
      const size = 25
      const total = 487
      return (
        <Pagination
          {...args}
          page={page}
          pageCount={Math.ceil(total / size)}
          onPageChange={setPage}
          range={`${(page - 1) * size + 1}–${Math.min(page * size, total)} of ${total}`}
        />
      )
    }
    return <Demo />
  },
}

export const Inline: Story = {
  args: { appearance: 'inline', page: 5, pageCount: 10, range: undefined },
}
