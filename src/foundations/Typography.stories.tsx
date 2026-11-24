import type { Meta, StoryObj } from '@storybook/react-vite'
import { TEXT_STYLES } from '@/lib/theme'
import { cn } from '@/lib/utils'
import { Page, Section } from './docs'

const meta = {
  title: 'Foundations/Typography',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const TypeScale: Story = {
  render: () => (
    <Page
      title="Typography"
      description="Inter throughout. Each text-* utility sets size, line height, letter spacing and weight from the Figma text styles."
    >
      <Section title="Typeface">
        <div className="flex items-end gap-10">
          <span className="text-[96px] leading-none font-semibold tracking-tight">Aa</span>
          <div className="flex flex-col gap-1">
            <span className="text-heading-1">Inter</span>
            <span className="text-small text-muted-foreground">
              Regular 400 · Medium 500 · Semi Bold 600
            </span>
            <span className="text-small text-muted-foreground">
              Set once in --font-sans (src/styles/globals.css)
            </span>
          </div>
        </div>
      </Section>

      <Section title="Type scale" description="Tailwind class → Figma text style.">
        <div className="flex flex-col divide-y">
          {TEXT_STYLES.map((t) => (
            <div key={t.key} className="grid grid-cols-[12rem_1fr_14rem] items-baseline gap-6 py-4">
              <code className="font-mono text-caption text-muted-foreground">
                text-{t.key}
                {t.uppercase && ' uppercase'}
              </code>
              <span className={cn(`text-${t.key}`, t.uppercase && 'uppercase')}>
                The quick brown fox resolves the ticket
              </span>
              <span className="text-caption text-muted-foreground">
                {t.figma.replace('TBT/', '')} · {t.size}/{t.lineHeight} · {t.weight}
                {t.letterSpacingEm !== 0 && ` · ${t.letterSpacingEm * 100}%`}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Hierarchy in use">
        <div className="flex max-w-xl flex-col gap-2 rounded-xl border bg-card p-6">
          <span className="text-overline text-muted-foreground uppercase">Ticket #4821</span>
          <h3 className="text-heading-1">Printer on floor 3 is offline</h3>
          <p className="text-body text-muted-foreground">
            Reported by Dana via email. The printer stopped responding after this morning&apos;s
            firmware update.
          </p>
          <div className="flex gap-4 pt-2">
            <span className="text-label">Assignee</span>
            <span className="text-small text-muted-foreground">Updated 5 min ago</span>
          </div>
        </div>
      </Section>
    </Page>
  ),
}
