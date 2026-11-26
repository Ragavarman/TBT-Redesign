/**
 * Two-letter initials, as Figma draws them:
 * "Tara Lane" → "TL" (first + last word) · "RingCentral" → "RC" (capitals of one camel-case word) ·
 * "System" / "Bluefin" → "SY" / "BL" (first two letters of a single word).
 */
export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  if (words.length > 1) {
    return ((words[0]?.[0] ?? '') + (words[words.length - 1]?.[0] ?? '')).toUpperCase()
  }
  const word = words[0]!
  const capitals = word.match(/\p{Lu}/gu)
  if (capitals && capitals.length >= 2) return capitals[0]! + capitals[capitals.length - 1]!
  return word.slice(0, 2).toUpperCase()
}
