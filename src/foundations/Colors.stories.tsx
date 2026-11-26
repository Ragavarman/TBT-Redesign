import type { Meta, StoryObj } from '@storybook/react-vite'
import { ACCENTS, BASES, PRIMITIVE_FAMILIES, SHADES } from '@/lib/theme'
import { Grid, Page, Section, Swatch } from './docs'

const meta = {
  title: 'Foundations/Colors',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const group = (names: string[]) => names.map((n) => <Swatch key={n} name={n} cssVar={`--${n}`} />)

/** Semantic tokens (Figma · Mode collection). Switch Mode / Accent / Base in the toolbar. */
export const Semantic: Story = {
  render: () => (
    <Page
      title="Color Palette"
      description="Semantic tokens resolve per mode (Light / Dark), accent theme and neutral base. Components only use these, never primitives."
    >
      <Section title="Surface & text" description="Neutral surfaces carry the layout.">
        <Grid>
          {group([
            'background',
            'foreground',
            'card',
            'card-foreground',
            'popover',
            'popover-foreground',
            'muted',
            'muted-foreground',
            'secondary',
            'secondary-foreground',
            'accent',
            'accent-foreground',
          ])}
        </Grid>
      </Section>
      <Section title="Brand & interaction" description="Primary follows the accent theme.">
        <Grid>{group(['primary', 'primary-foreground', 'border', 'input', 'ring'])}</Grid>
      </Section>
      <Section
        title="Status"
        description="Solid for text, icons and fills; soft for tinted backgrounds. Always paired with a glyph and label."
      >
        <Grid cols={4}>
          {group([
            'success',
            'success-soft',
            'warning',
            'warning-soft',
            'info',
            'info-soft',
            'destructive',
            'destructive-soft',
            'destructive-foreground',
          ])}
        </Grid>
      </Section>
      <Section title="Sidebar">
        <Grid cols={4}>
          {group([
            'sidebar',
            'sidebar-foreground',
            'sidebar-primary',
            'sidebar-primary-foreground',
            'sidebar-accent',
            'sidebar-accent-foreground',
            'sidebar-border',
            'sidebar-ring',
          ])}
        </Grid>
      </Section>
      <Section title="Charts" description="Five steps of the active accent.">
        <Grid cols={5}>{group(['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'])}</Grid>
      </Section>
    </Page>
  ),
}

/** All 10 accent themes side by side (each card sets its own data-theme). */
export const AccentThemes: Story = {
  render: () => (
    <Page
      title="Accent themes"
      description="Theme sets primary and charts. Each card below is scoped with data-theme, so you can compare all ten at once."
    >
      <div className="grid grid-cols-5 gap-4">
        {ACCENTS.map((accent) => (
          <div
            key={accent}
            data-theme={accent}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4"
          >
            <span className="text-title capitalize">{accent}</span>
            <div className="flex h-8 items-center justify-center rounded-md bg-primary text-label text-primary-foreground">
              Primary
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-6 flex-1 rounded-sm"
                  style={{ background: `var(--chart-${i})` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Page>
  ),
}

/** All 7 neutral bases (each column sets its own data-base). */
export const BaseColors: Story = {
  render: () => (
    <Page
      title="Base colors"
      description="Base sets the neutral family behind every surface, border and muted text."
    >
      <div className="flex flex-col gap-3">
        {BASES.map((base) => (
          <div
            key={base}
            data-base={base}
            className="grid grid-cols-[6rem_repeat(11,1fr)] items-center gap-2"
          >
            <span className="text-label capitalize">{base}</span>
            {SHADES.map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div
                  className="h-10 w-full rounded-md"
                  style={{ background: `var(--base-${s})` }}
                />
                <span className="text-caption text-muted-foreground">{s}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Page>
  ),
}

/** Raw primitive palette (Figma · Primitives). Do not use directly in components. */
export const Primitives: Story = {
  render: () => (
    <Page
      title="Primitive palette"
      description="The raw scales that bases, themes and status colors point to. Use semantic tokens in components instead."
    >
      <div className="flex flex-col gap-2">
        {PRIMITIVE_FAMILIES.map((family) => (
          <div key={family} className="grid grid-cols-[6rem_repeat(11,1fr)] items-center gap-2">
            <span className="text-label capitalize">{family}</span>
            {SHADES.map((s) => (
              <div
                key={s}
                title={`${family}/${s}`}
                className="h-8 rounded-sm"
                style={{ background: `var(--tbt-${family}-${s})` }}
              />
            ))}
          </div>
        ))}
        <div className="grid grid-cols-[6rem_repeat(11,1fr)] gap-2">
          <span />
          {SHADES.map((s) => (
            <span key={s} className="text-center text-caption text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      </div>
    </Page>
  ),
}
