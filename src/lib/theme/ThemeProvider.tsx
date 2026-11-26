import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'
import {
  DEFAULT_SETTINGS,
  applyTheme,
  loadSettings,
  sanitizeSettings,
  saveSettings,
  systemMode,
  type Mode,
  type ThemeSettings,
} from './theme'

export interface ThemeProviderProps {
  children: ReactNode
  /** Initial settings when nothing is stored. */
  defaultSettings?: Partial<ThemeSettings>
  /** localStorage key. Pass `null` to disable persistence. */
  storageKey?: string | null
}

/**
 * Applies TBT mode (light/dark/system), accent theme and neutral base to <html>.
 *
 * ```tsx
 * <ThemeProvider defaultSettings={{ accent: 'indigo', base: 'zinc' }}>
 *   <App />
 * </ThemeProvider>
 * ```
 */
export function ThemeProvider({
  children,
  defaultSettings,
  storageKey = 'tbt-theme',
}: ThemeProviderProps) {
  const [raw, setSettings] = useState<ThemeSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...defaultSettings,
    ...(storageKey ? loadSettings(storageKey) : {}),
  }))
  // Fill anything missing or invalid (state kept across a hot reload from an older shape,
  // or a bad patch) so consumers can always index FONTS / RADIUS_OPTIONS safely.
  const settings = useMemo(() => sanitizeSettings(raw), [raw])
  const [system, setSystem] = useState<Mode>(systemMode)

  // Track OS dark-mode changes for `mode: 'system'`.
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mq) return
    const onChange = () => setSystem(mq.matches ? 'dark' : 'light')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const resolvedMode: Mode = settings.mode === 'system' ? system : settings.mode

  useEffect(() => {
    applyTheme({ ...settings, mode: resolvedMode })
  }, [resolvedMode, settings])

  useEffect(() => {
    if (storageKey) saveSettings(storageKey, settings)
  }, [storageKey, settings])

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...settings,
      resolvedMode,
      setMode: (mode) => setSettings((s) => ({ ...s, mode })),
      setAccent: (accent) => setSettings((s) => ({ ...s, accent })),
      setBase: (base) => setSettings((s) => ({ ...s, base })),
      update: (patch) => setSettings((s) => sanitizeSettings({ ...s, ...patch })),
      reset: () => setSettings({ ...DEFAULT_SETTINGS, ...defaultSettings }),
    }),
    [settings, resolvedMode, defaultSettings],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
