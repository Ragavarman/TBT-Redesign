import { createContext } from 'react'
import type { Accent, Base } from './tokens.generated'
import type { FontId, Mode, ModePreference, Radius, ThemeSettings } from './theme'

export interface ThemeContextValue {
  /** User preference (may be `system`). */
  mode: ModePreference
  /** Mode actually applied after resolving `system`. */
  resolvedMode: Mode
  accent: Accent
  base: Base
  radius: Radius
  headingFont: FontId
  bodyFont: FontId
  setMode: (mode: ModePreference) => void
  setAccent: (accent: Accent) => void
  setBase: (base: Base) => void
  /** Change several settings at once (radius, fonts, …). */
  update: (patch: Partial<ThemeSettings>) => void
  /** Back to the design defaults. */
  reset: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
