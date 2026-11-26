# TBT Design System

Component library for the TBT helpdesk redesign, built from the TBT v3 Figma file.

**Stack:** React 19 · Vite · TypeScript · Tailwind CSS v4 · shadcn (Radix) · Storybook 10

## Getting started

```bash
npm install
npm run storybook   # component showcase at http://localhost:6006
```

## Scripts

| Script                    | What it does                                  |
| ------------------------- | --------------------------------------------- |
| `npm run storybook`       | Start Storybook                               |
| `npm run build-storybook` | Build static Storybook to `storybook-static/` |
| `npm run build`           | Typecheck and build                           |
| `npm run typecheck`       | TypeScript only                               |
| `npm run lint`            | oxlint, including the atomic layer rules      |
| `npm run format`          | Prettier (with Tailwind class sorting)        |

## Structure

```
src/
  styles/globals.css      design tokens (modes, accent themes, neutral bases)
  components/
    ui/                   shadcn primitives, restyled to TBT tokens
    atoms/                Button, Input, Badge, …
    molecules/            FormField, Tabs, TicketStatusBadge, …
    organisms/            Sidebar, DataTable, Dialog, TicketList, …
    templates/            AppShell, ListDetailTemplate, …
  lib/                    utilities
  types/                  domain types (Ticket, Status, Priority, SLA)
```

Imports only go downward (templates → organisms → molecules → atoms → ui). `npm run lint` fails on any import that breaks this.

## Design tokens

Tokens come from the Figma variables and are **generated**, not hand-written:

```
tokens/figma-tokens.json  ──npm run tokens──►  src/styles/tokens.css
   (Figma snapshot)                             src/lib/theme/tokens.generated.ts
```

| Figma collection | CSS                                      | Switch with           |
| ---------------- | ---------------------------------------- | --------------------- |
| Primitives       | `--tbt-blue-600`, …                      | —                     |
| Base color (7)   | `--base-50 … 950`                        | `data-base="zinc"`    |
| Theme (10)       | `--theme-primary-light`, charts          | `data-theme="indigo"` |
| Mode (2)         | `--background`, `--primary`, … (39)      | `class="dark"`        |
| Text styles      | `text-display`, `text-body`, …           | —                     |
| Effect styles    | `shadow-raised`, `shadow-overlay`, …     | —                     |
| Layout           | `rounded-xs … 2xl`, `h-control-sm/md/lg` | —                     |

To pick up Figma changes: re-export `tokens/figma-tokens.json`, then `npm run tokens`.

### Theming in an app

```tsx
import { ThemeProvider, useTheme } from '@/lib/theme'

export function Root() {
  return (
    <ThemeProvider defaultSettings={{ mode: 'system', accent: 'blue', base: 'neutral' }}>
      <App />
    </ThemeProvider>
  )
}

// anywhere inside:
const { setMode, setAccent, setBase } = useTheme()
```

Mode, accent and base can also be scoped to any element with `class="dark"`, `data-theme` and `data-base`.

### Changing the font

The typeface is set once in `--font-sans` in `src/styles/globals.css`.
