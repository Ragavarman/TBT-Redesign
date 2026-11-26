import { useState } from 'react'

/**
 * Edit a saved settings document locally: `draft` changes as the user types, `dirty` says it
 * differs from what's saved, `commit` hands it back, `reset` throws the changes away.
 */
export function useDraft<T>(saved: T, save: (next: T) => void) {
  const [draft, setDraft] = useState(saved)
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved)
  const patch = (p: Partial<T>) => setDraft((d) => ({ ...d, ...p }))
  return {
    draft,
    patch,
    setDraft,
    dirty,
    commit: () => save(draft),
    reset: () => setDraft(saved),
  }
}
