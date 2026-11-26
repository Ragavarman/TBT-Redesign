#!/usr/bin/env node
/**
 * Post-process files from `shadcn add` so they work in this project.
 *
 * 1. `import { cn } from "cn"` → `import { cn } from '@/lib/utils'`
 *    (our cn knows the TBT text/shadow/control tokens).
 * 2. shadcn's current registry styles target boolean data attributes
 *    (data-open, data-checked, data-horizontal …), but Radix only sets
 *    data-state="open|closed|checked|unchecked|indeterminate|active|inactive"
 *    and data-orientation="horizontal|vertical". Rewrite those variants.
 *
 * Run: npm run ui:fix   (idempotent; safe to run on every file in src/components/ui)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../src/components/ui')

const STATE = ['open', 'closed', 'checked', 'unchecked', 'indeterminate', 'active', 'inactive']
const ORIENTATION = ['horizontal', 'vertical']

// Matches a data-<name> variant at a token boundary: data-open:, group-data-open/x:, not-data-checked:, …
const variant = (name, replacement) => [
  new RegExp(`(^|[\\s"'\`:-])data-${name}(?=[:/])`, 'g'),
  `$1data-[${replacement}]`,
]

const rules = [
  [/import \{ cn \} from ["']cn["']/g, "import { cn } from '@/lib/utils'"],
  ...STATE.map((s) => variant(s, `state=${s}`)),
  ...ORIENTATION.map((o) => variant(o, `orientation=${o}`)),
]

let changed = 0
for (const file of readdirSync(dir).filter((f) => f.endsWith('.tsx'))) {
  const path = join(dir, file)
  const before = readFileSync(path, 'utf8')
  const after = rules.reduce((s, [re, rep]) => s.replace(re, rep), before)
  if (after !== before) {
    writeFileSync(path, after)
    changed++
    console.log(`  fixed ${file}`)
  }
}
console.log(`✔ ui:fix — ${changed} file(s) updated`)
