import { useEffect, useRef } from 'react'

/**
 * Single-key shortcuts for a screen: `{ e: resolve, 'shift+a': openAssignee, escape: back }`.
 *
 * - Keys are `KeyboardEvent.key`, lower-cased, with an optional `shift+` prefix.
 * - Ignored while typing (input, textarea, select, contenteditable) and when Ctrl / ⌘ / Alt is
 *   held, so browser and OS shortcuts keep working.
 * - Ignored while a popover, menu or dialog is open — that layer owns the keyboard.
 */
export function useHotkeys(map: Record<string, () => void>, enabled = true) {
  // keep the latest handlers without re-binding the listener every render
  const ref = useRef(map)
  useEffect(() => {
    ref.current = map
  })

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return
      if (isTyping(e.target) || overlayOpen()) return
      const key = e.key.toLowerCase()
      const handler = ref.current[e.shiftKey && key.length === 1 ? `shift+${key}` : key]
      if (!handler) return
      e.preventDefault()
      handler()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return target.closest('input, textarea, select, [role=combobox]') !== null
}

/** Radix popovers, menus and dialogs render their content in these wrappers while open. */
function overlayOpen() {
  return (
    document.querySelector(
      '[data-radix-popper-content-wrapper], [role=dialog][data-state=open], [role=alertdialog][data-state=open]',
    ) !== null
  )
}
