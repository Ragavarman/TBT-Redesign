import type { NavItem } from '@/components/organisms'
import { moduleNav } from '@/mocks'

/** URL for a module's view: /inbox/all, /reports/overview… */
export const viewPath = (module: string, view: string) => `/${module}/${view}`

/** A module's first menu item — where the rail sends you. */
export function defaultView(module: string): string | undefined {
  return moduleNav[module]?.sections[0]?.items[0]?.id
}

/** Look a menu item up by id, including nested children (e.g. Lifecycle › Investigating). */
export function findNavItem(module: string, view: string): NavItem | undefined {
  const walk = (items: NavItem[]): NavItem | undefined => {
    for (const item of items) {
      if (item.id === view) return item
      const child = item.children && walk(item.children)
      if (child) return child
    }
    return undefined
  }
  for (const section of moduleNav[module]?.sections ?? []) {
    const hit = walk(section.items)
    if (hit) return hit
  }
  return undefined
}
