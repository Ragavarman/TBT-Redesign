import { useEffect } from 'react'
import type { Decorator, Preview } from '@storybook/react-vite'
import {
  ACCENTS,
  BASES,
  DEFAULT_ACCENT,
  DEFAULT_BASE,
  applyTheme,
  type Accent,
  type Base,
  type Mode,
} from '../src/lib/theme'
import './preview.css'

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** Applies the toolbar's Mode / Accent / Base to <html>, exactly like <ThemeProvider> does in an app. */
function ThemeSync({ mode, accent, base }: { mode: Mode; accent: Accent; base: Base }) {
  useEffect(() => {
    applyTheme({ mode, accent, base })
  }, [mode, accent, base])
  return null
}

const withTbtTheme: Decorator = (Story, context) => {
  const { mode, accent, base } = context.globals as { mode: Mode; accent: Accent; base: Base }
  return (
    <>
      <ThemeSync mode={mode} accent={accent} base={base} />
      <Story />
    </>
  )
}

const preview: Preview = {
  globalTypes: {
    mode: {
      description: 'Light / Dark mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    accent: {
      description: 'Accent theme (primary + charts)',
      toolbar: {
        title: 'Accent',
        icon: 'paintbrush',
        items: ACCENTS.map((a) => ({ value: a, title: title(a) })),
        dynamicTitle: true,
      },
    },
    base: {
      description: 'Neutral base color',
      toolbar: {
        title: 'Base',
        icon: 'contrast',
        items: BASES.map((b) => ({ value: b, title: title(b) })),
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    mode: 'light',
    accent: DEFAULT_ACCENT,
    base: DEFAULT_BASE,
  },
  parameters: {
    layout: 'centered',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'todo' },
    options: {
      storySort: {
        order: ['Introduction', 'Foundations', 'Atoms', 'Molecules', 'Organisms', 'Templates'],
      },
    },
  },
  decorators: [withTbtTheme],
}

export default preview
