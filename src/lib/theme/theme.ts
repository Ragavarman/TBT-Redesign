import {
  ACCENTS,
  BASES,
  DEFAULT_ACCENT,
  DEFAULT_BASE,
  type Accent,
  type Base,
} from './tokens.generated'

export type Mode = 'light' | 'dark'
/** What the user picks. `system` follows the OS `prefers-color-scheme`. */
export type ModePreference = Mode | 'system'

/** Corner roundness (Figma S14 · Border radius). Small is the design default. */
export const RADIUS_OPTIONS = {
  none: { label: 'None', px: 0 },
  small: { label: 'Small', px: 6 },
  medium: { label: 'Medium', px: 10 },
  large: { label: 'Large', px: 14 },
} as const
export type Radius = keyof typeof RADIUS_OPTIONS

/** Typefaces the user can pick for headings and body text (Figma S14 · Fonts). */
export const FONTS = {
  inter: { label: 'Inter', stack: "'Inter Variable', ui-sans-serif, system-ui, sans-serif" },
  geist: { label: 'Geist', stack: "'Geist Variable', ui-sans-serif, system-ui, sans-serif" },
  plex: {
    label: 'IBM Plex Sans',
    stack: "'IBM Plex Sans Variable', ui-sans-serif, system-ui, sans-serif",
  },
  manrope: { label: 'Manrope', stack: "'Manrope Variable', ui-sans-serif, system-ui, sans-serif" },
  serif: {
    label: 'Source Serif 4',
    stack: "'Source Serif 4 Variable', ui-serif, Georgia, serif",
  },
  system: { label: 'System UI', stack: 'ui-sans-serif, system-ui, sans-serif' },
} as const
export type FontId = keyof typeof FONTS

export interface ThemeSettings {
  mode: ModePreference
  accent: Accent
  base: Base
  radius: Radius
  headingFont: FontId
  bodyFont: FontId
}

export const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'system',
  accent: DEFAULT_ACCENT,
  base: DEFAULT_BASE,
  radius: 'small',
  headingFont: 'inter',
  bodyFont: 'inter',
}

export const isAccent = (v: unknown): v is Accent => ACCENTS.includes(v as Accent)
export const isBase = (v: unknown): v is Base => BASES.includes(v as Base)
export const isModePreference = (v: unknown): v is ModePreference =>
  v === 'light' || v === 'dark' || v === 'system'
export const isRadius = (v: unknown): v is Radius => typeof v === 'string' && v in RADIUS_OPTIONS
export const isFont = (v: unknown): v is FontId => typeof v === 'string' && v in FONTS

export function systemMode(): Mode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const resolveMode = (pref: ModePreference): Mode => (pref === 'system' ? systemMode() : pref)

/**
 * Applies the theme to an element (defaults to <html>).
 * Matches the selectors in src/styles/tokens.css and globals.css: `.dark`, `[data-theme]`,
 * `[data-base]`, `[data-radius]`, and the `--app-font-*` variables.
 */
export function applyTheme(
  settings: {
    mode: Mode
    accent: Accent
    base: Base
    radius?: Radius
    headingFont?: FontId
    bodyFont?: FontId
  },
  el: HTMLElement = document.documentElement,
) {
  el.classList.toggle('dark', settings.mode === 'dark')
  el.style.colorScheme = settings.mode
  el.dataset.theme = settings.accent
  el.dataset.base = settings.base
  if (settings.radius) el.dataset.radius = settings.radius
  if (settings.bodyFont) el.style.setProperty('--app-font-body', FONTS[settings.bodyFont].stack)
  if (settings.headingFont)
    el.style.setProperty('--app-font-heading', FONTS[settings.headingFont].stack)
}

// -- persistence (best effort: storage can be unavailable in private mode / sandboxes)

export function loadSettings(key: string): Partial<ThemeSettings> {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return {}
    const p = parsed as Record<string, unknown>
    return {
      ...(isModePreference(p.mode) && { mode: p.mode }),
      ...(isAccent(p.accent) && { accent: p.accent }),
      ...(isBase(p.base) && { base: p.base }),
      ...(isRadius(p.radius) && { radius: p.radius }),
      ...(isFont(p.headingFont) && { headingFont: p.headingFont }),
      ...(isFont(p.bodyFont) && { bodyFont: p.bodyFont }),
    }
  } catch {
    return {}
  }
}

export function saveSettings(key: string, settings: ThemeSettings) {
  try {
    window.localStorage.setItem(key, JSON.stringify(settings))
  } catch {
    /* ignore */
  }
}
