import { createContext } from 'react'
import type { Accent, Base } from './tokens.generated'
import type { Mode, ModePreference } from './theme'

export interface ThemeContextValue {
  /** User preference (may be `system`). */
  mode: ModePreference
  /** Mode actually applied after resolving `system`. */
  resolvedMode: Mode
  accent: Accent
  base: Base
  setMode: (mode: ModePreference) => void
  setAccent: (accent: Accent) => void
  setBase: (base: Base) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
