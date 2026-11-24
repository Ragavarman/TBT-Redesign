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

export interface ThemeSettings {
  mode: ModePreference
  accent: Accent
  base: Base
}

export const DEFAULT_SETTINGS: ThemeSettings = {
  mode: 'system',
  accent: DEFAULT_ACCENT,
  base: DEFAULT_BASE,
}

export const isAccent = (v: unknown): v is Accent => ACCENTS.includes(v as Accent)
export const isBase = (v: unknown): v is Base => BASES.includes(v as Base)
export const isModePreference = (v: unknown): v is ModePreference =>
  v === 'light' || v === 'dark' || v === 'system'

export function systemMode(): Mode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const resolveMode = (pref: ModePreference): Mode => (pref === 'system' ? systemMode() : pref)

/**
 * Applies mode / accent / base to an element (defaults to <html>).
 * Matches the selectors in src/styles/tokens.css: `.dark`, `[data-theme]`, `[data-base]`.
 */
export function applyTheme(
  settings: { mode: Mode; accent: Accent; base: Base },
  el: HTMLElement = document.documentElement,
) {
  el.classList.toggle('dark', settings.mode === 'dark')
  el.style.colorScheme = settings.mode
  el.dataset.theme = settings.accent
  el.dataset.base = settings.base
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
