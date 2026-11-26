import type { ReactNode } from 'react'
import { Button } from '@/components/atoms'
import { FormField, Select } from '@/components/molecules'
import { SettingsSection } from '@/components/organisms'
import {
  ACCENTS,
  BASES,
  DEFAULT_SETTINGS,
  FONTS,
  RADIUS_OPTIONS,
  isFont,
  type ModePreference,
  type Radius,
  type ThemeSettings,
} from '@/lib/theme'
import { rem } from '@/lib/units'
import { cn } from '@/lib/utils'
import { SettingsPage } from './SettingsKit'

const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1)
const MODES: ModePreference[] = ['light', 'dark', 'system']
const FONT_OPTIONS = Object.entries(FONTS).map(([value, f]) => ({ value, label: f.label }))

export interface AppearancePageProps {
  sidebar: ReactNode
  value: ThemeSettings
  onChange: (patch: Partial<ThemeSettings>) => void
  onReset: () => void
}

/** Figma S14 · Settings — Appearance. Every choice applies at once; nothing to save. */
export function AppearancePage({ sidebar, value, onChange, onReset }: AppearancePageProps) {
  const isDefault = (Object.keys(DEFAULT_SETTINGS) as (keyof ThemeSettings)[]).every(
    (k) => value[k] === DEFAULT_SETTINGS[k],
  )
  const heading = FONTS[value.headingFont] ?? FONTS.inter
  const body = FONTS[value.bodyFont] ?? FONTS.inter
  const setFont = (key: 'headingFont' | 'bodyFont') => (v: string) => {
    if (isFont(v)) onChange({ [key]: v })
  }
  return (
    <SettingsPage
      sidebar={sidebar}
      title="Appearance"
      icon="display"
      description="Choose how TBT looks for you. Changes apply instantly and only affect your account."
      actions={
        !isDefault && (
          <Button variant="ghost" onClick={onReset}>
            Reset to defaults
          </Button>
        )
      }
    >
      <SettingsSection
        title="Color"
        description="Choose your mode, base color and accent theme."
        columns={1}
      >
        <Block label="Mode">
          <div role="radiogroup" aria-label="Mode" className="grid grid-cols-3 gap-3">
            {MODES.map((m) => (
              <label key={m} className="group flex cursor-pointer flex-col gap-2">
                <input
                  type="radio"
                  name="mode"
                  value={m}
                  checked={value.mode === m}
                  onChange={() => onChange({ mode: m })}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    'relative block h-34 overflow-hidden rounded-lg border-2 transition-colors',
                    'peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
                    value.mode === m ? 'border-primary' : 'border-border group-hover:border-ring',
                  )}
                >
                  {m === 'system' ? (
                    <>
                      <ModePreview tone="light" />
                      <span className="absolute inset-0 [clip-path:inset(0_0_0_50%)]">
                        <ModePreview tone="dark" />
                      </span>
                    </>
                  ) : (
                    <ModePreview tone={m} />
                  )}
                </span>
                <span className="flex items-center gap-2 text-body text-foreground">
                  <RadioDot on={value.mode === m} />
                  {cap(m)}
                </span>
              </label>
            ))}
          </div>
        </Block>
        <Divider />
        <Block label="Base color" description="Neutral tone for backgrounds, borders and text.">
          <ChipGroup
            name="base"
            options={BASES}
            value={value.base}
            onChange={(base) => onChange({ base })}
          />
        </Block>
        <Divider />
        <Block
          label="Theme"
          description="Accent for primary buttons, links, focus rings and charts."
        >
          <ChipGroup
            name="accent"
            options={ACCENTS}
            value={value.accent}
            onChange={(accent) => onChange({ accent })}
          />
        </Block>
      </SettingsSection>

      <SettingsSection
        title="Fonts"
        description="Typefaces for headings and body text across the app."
      >
        <FormField label="Heading">
          <Select
            value={value.headingFont}
            onValueChange={setFont('headingFont')}
            options={FONT_OPTIONS}
          />
        </FormField>
        <FormField label="Body">
          <Select
            value={value.bodyFont}
            onValueChange={setFont('bodyFont')}
            options={FONT_OPTIONS}
          />
        </FormField>
        <div className="col-span-full flex flex-col gap-1.5 rounded-lg bg-muted p-4">
          <span className="text-caption text-muted-foreground uppercase">
            Preview · {heading.label} / {body.label}
          </span>
          <span className="text-heading-2 text-foreground" style={{ fontFamily: heading.stack }}>
            Printer offline at Main Office
          </span>
          <span className="text-body text-muted-foreground" style={{ fontFamily: body.stack }}>
            Kasun reported the HP LaserJet stopped responding after this morning’s update. We’re
            checking the print queue and will reply by 2:00 PM.
          </span>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Border radius"
        description="Corner roundness for buttons, inputs, cards and menus."
        columns={1}
      >
        <div role="radiogroup" aria-label="Border radius" className="grid grid-cols-4 gap-3">
          {(Object.keys(RADIUS_OPTIONS) as Radius[]).map((r) => {
            const on = value.radius === r
            return (
              <label
                key={r}
                className={cn(
                  'flex cursor-pointer flex-col gap-3 rounded-lg border-2 p-2.5 transition-colors',
                  'has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
                  on ? 'border-primary' : 'border-border hover:border-ring',
                )}
              >
                <input
                  type="radio"
                  name="radius"
                  value={r}
                  checked={on}
                  onChange={() => onChange({ radius: r })}
                  className="sr-only"
                />
                {/* Fixed corner sample — it shows the option, so it ignores the active radius. */}
                <span className="relative block h-13 overflow-hidden rounded-[0.375rem] bg-muted">
                  <span
                    className={cn(
                      'absolute top-3.5 left-4 h-12 w-16 border-2',
                      on ? 'border-primary' : 'border-muted-foreground',
                    )}
                    style={{
                      borderTopLeftRadius: rem(RADIUS_OPTIONS[r].px),
                      borderTopRightRadius: rem(RADIUS_OPTIONS[r].px),
                    }}
                  />
                </span>
                <span className="flex flex-col px-1">
                  <span className="text-body text-foreground">{RADIUS_OPTIONS[r].label}</span>
                  <span className="text-small text-muted-foreground">
                    {RADIUS_OPTIONS[r].px}px{r === DEFAULT_SETTINGS.radius && ' · Default'}
                  </span>
                </span>
              </label>
            )
          })}
        </div>
      </SettingsSection>
    </SettingsPage>
  )
}

function Block({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-0.5">
        <h3 className="text-body-strong text-foreground">{label}</h3>
        {description && <p className="text-small text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  )
}

function Divider() {
  return <hr className="border-border" />
}

function RadioDot({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-4 place-items-center rounded-full border',
        on ? 'border-primary bg-primary' : 'border-input',
      )}
    >
      {on && <span className="size-1.5 rounded-full bg-primary-foreground" />}
    </span>
  )
}

/** Colour chips for bases and accents; the swatch is the family's 500 step. */
function ChipGroup<T extends string>({
  name,
  options,
  value,
  onChange,
}: {
  name: string
  options: readonly T[]
  value: T
  onChange: (v: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={cap(name)} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <label
          key={o}
          className={cn(
            'flex h-7 cursor-pointer items-center gap-1.5 rounded-md border px-2.5 text-body transition-colors',
            'has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
            value === o
              ? 'border-primary text-foreground ring-1 ring-primary'
              : 'text-foreground hover:bg-accent',
          )}
        >
          <input
            type="radio"
            name={name}
            value={o}
            checked={value === o}
            onChange={() => onChange(o)}
            className="sr-only"
          />
          <span
            aria-hidden
            className="size-3.5 rounded-full"
            style={{ background: `var(--tbt-${o}-500)` }}
          />
          {cap(o)}
        </label>
      ))}
    </div>
  )
}

/** Miniature app window for the Mode cards. Fixed colours: it previews a mode, not the current one. */
function ModePreview({ tone }: { tone: 'light' | 'dark' }) {
  const dark = tone === 'dark'
  const line = dark ? 'bg-(--tbt-neutral-700)' : 'bg-(--tbt-neutral-200)'
  return (
    <span
      className={cn(
        'absolute inset-0 flex gap-0 p-1.5',
        dark ? 'bg-(--tbt-neutral-900)' : 'bg-(--tbt-neutral-100)',
      )}
    >
      <span className="flex w-1/4 flex-col gap-1.5 p-1.5">
        <span className="h-1.5 w-1.5 rounded-xs bg-primary" />
        {[80, 60, 90, 70, 80].map((w, i) => (
          <span key={i} className={cn('h-1 rounded-full', line)} style={{ width: `${w}%` }} />
        ))}
      </span>
      <span
        className={cn(
          'flex flex-1 flex-col gap-2 rounded-sm border p-2',
          dark
            ? 'border-(--tbt-neutral-800) bg-(--tbt-neutral-950)'
            : 'border-(--tbt-neutral-200) bg-white',
        )}
      >
        <span className="flex items-center justify-between">
          <span className={cn('h-1.5 w-2/5 rounded-full', line)} />
          <span className="h-2 w-5 rounded-xs bg-primary" />
        </span>
        <span
          className={cn(
            'flex flex-1 flex-col gap-1.5 rounded-sm border p-2',
            dark ? 'border-(--tbt-neutral-800)' : 'border-(--tbt-neutral-200)',
          )}
        >
          {[50, 90, 75, 85].map((w, i) => (
            <span key={i} className={cn('h-1 rounded-full', line)} style={{ width: `${w}%` }} />
          ))}
          <span className="mt-auto h-3 w-10 rounded-xs bg-primary" />
        </span>
      </span>
    </span>
  )
}
