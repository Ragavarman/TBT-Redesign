import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from './ThemeContext'

/** Read and change the active mode, accent theme and neutral base. Must be inside <ThemeProvider>. */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
