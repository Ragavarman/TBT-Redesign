import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { CollectionsContext, type CollectionsValue, type Identified } from './collections-context'

/** Holds every session collection (see useCollection). Changes last until reload. */
export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Record<string, Identified[]>>({})
  const set = useCallback(
    (key: string, items: Identified[]) => setData((d) => ({ ...d, [key]: items })),
    [],
  )
  const value = useMemo<CollectionsValue>(() => ({ data, set }), [data, set])
  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>
}
