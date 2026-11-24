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

### Changing the font

The typeface is set once in `--font-sans` in `src/styles/globals.css`.
