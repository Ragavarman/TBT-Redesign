import type { Preview } from '@storybook/react-vite'
import { withThemeByClassName } from '@storybook/addon-themes'
import '../src/styles/globals.css'

const preview: Preview = {
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
  decorators: [
    // Light / Dark mode. Accent theme + neutral base switchers are added in Step 2.
    withThemeByClassName({
      themes: { light: '', dark: 'dark' },
      defaultTheme: 'light',
    }),
  ],
}

export default preview
