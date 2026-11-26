import { createContext, useCallback, useContext, useMemo } from 'react'

/** Any record kept in a session collection. */
export interface Identified {
  id: string
}

export interface CollectionsValue {
  data: Record<string, Identified[]>
  set: (key: string, items: Identified[]) => void
}

export const CollectionsContext = createContext<CollectionsValue>({ data: {}, set: () => {} })

/**
 * A list of records for the session (inventory items, agents, canned replies, settings rows…):
 * starts from `seed`, and add / update / remove change it for every page that reads it.
 */
export function useCollection<T extends Identified>(key: string, seed: T[]) {
  const { data, set } = useContext(CollectionsContext)
  const items = (data[key] as T[] | undefined) ?? seed
  const write = useCallback((next: T[]) => set(key, next), [key, set])
  return useMemo(
    () => ({
      items,
      add: (item: T) => write([item, ...items]),
      update: (id: string, patch: Partial<T>) =>
        write(items.map((x) => (x.id === id ? { ...x, ...patch } : x))),
      upsert: (item: T) =>
        write(
          items.some((x) => x.id === item.id)
            ? items.map((x) => (x.id === item.id ? item : x))
            : [item, ...items],
        ),
      remove: (id: string) => write(items.filter((x) => x.id !== id)),
      replace: write,
    }),
    [items, write],
  )
}

/** A short unique id for records made in the session. */
export const newId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`
