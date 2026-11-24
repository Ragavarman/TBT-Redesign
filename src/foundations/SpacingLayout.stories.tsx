import type { Meta, StoryObj } from '@storybook/react-vite'
import { RADII, SHADOWS, SPACING } from '@/lib/theme'
import { Page, Section } from './docs'

const meta = {
  title: 'Foundations/Spacing & Layout',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SPACING_USE: Record<number, string> = {
  2: 'Hairline offsets',
  4: 'Icon ↔ label, badge padding',
  6: 'Tight inline groups',
  8: 'Between related controls',
  10: 'Compact list padding',
  12: 'Control padding, card header',
  16: 'Card padding, list rows',
  20: 'Dialog padding',
  24: 'Between groups',
  32: 'Specimen / panel padding',
  40: 'Large section gaps',
  56: 'Page section rhythm',
}

const SHADOW_USE: Record<string, string> = {
  raised: 'Hover cards, draggable rows',
  overlay: 'Menus, popovers, toasts, bulk bar',
  modal: 'Dialogs and confirmation modals',
  focus: 'Keyboard focus on controls',
  card: 'Card shadow (legacy style)',
}

const RADIUS_USE: Record<string, string> = {
  sm: 'Controls',
  md: 'Menus, list items',
  xl: 'Cards, dialogs',
}

const CONTROLS = [
  { key: 'sm', px: 28 },
  { key: 'md', px: 32 },
  { key: 'lg', px: 36 },
]

export const SpacingAndLayout: Story = {
  name: 'Spacing & Layout',
  render: () => (
    <Page
      title="Spacing & Layout"
      description="A 4px base grid. Figma space/N (px) maps to Tailwind spacing N÷4 — e.g. space/16 → p-4, gap-4."
    >
      <Section title="Spacing scale">
        <div className="flex flex-col divide-y">
          {SPACING.map((s) => (
            <div
              key={s.px}
              className="grid grid-cols-[8rem_6rem_16rem_1fr] items-center gap-4 py-2.5"
            >
              <code className="font-mono text-caption">{s.figma}</code>
              <code className="font-mono text-caption text-muted-foreground">p-{s.tailwind}</code>
              <div className="h-2 rounded-xs bg-primary" style={{ width: s.px * 4 }} />
              <span className="text-small text-muted-foreground">{SPACING_USE[s.px]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Corner radius"
        description="Controls 6, menus and list items 8, cards and dialogs 12, pills full."
      >
        <div className="flex flex-wrap gap-6">
          {[...RADII, { key: 'full', px: 9999 }].map((r) => (
            <div key={r.key} className="flex w-24 flex-col items-center gap-2 text-center">
              <div className={`size-20 border bg-card rounded-${r.key}`} />
              <code className="font-mono text-caption">rounded-{r.key}</code>
              <span className="text-caption text-muted-foreground">
                {r.key === 'full'
                  ? 'Pills, avatars'
                  : `${r.px}px${RADIUS_USE[r.key] ? ` · ${RADIUS_USE[r.key]}` : ''}`}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Elevation"
        description="Most surfaces are flat with a border; shadows are only for things that float."
      >
        <div className="grid grid-cols-5 gap-5">
          {SHADOWS.map((s) => (
            <div
              key={s.key}
              className={`flex h-24 flex-col justify-end gap-1 rounded-xl bg-card p-4 shadow-${s.key}`}
            >
              <code className="font-mono text-caption">shadow-{s.key}</code>
              <span className="text-caption text-muted-foreground">{SHADOW_USE[s.key]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Control heights"
        description="All interactive controls share three heights so they align in toolbars and forms."
      >
        <div className="flex flex-wrap items-end gap-10">
          {CONTROLS.map((c) => (
            <div key={c.key} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-control-${c.key} items-center rounded-md bg-primary px-3 text-label text-primary-foreground`}
                >
                  Button
                </div>
                <div
                  className={`flex h-control-${c.key} w-40 items-center rounded-md border bg-background px-3 text-small text-muted-foreground`}
                >
                  Placeholder
                </div>
              </div>
              <code className="font-mono text-caption">
                h-control-{c.key} · {c.px}px{c.key === 'md' && ' (default)'}
              </code>
            </div>
          ))}
        </div>
      </Section>
    </Page>
  ),
}
