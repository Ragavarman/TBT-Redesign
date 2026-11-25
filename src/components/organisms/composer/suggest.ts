/** What the caret is on: a "/canned" or "@mention" token being typed. */
export interface SuggestToken {
  trigger: '/' | '@'
  /** Text after the trigger. */
  query: string
  /** Index of the trigger character in the text. */
  start: number
  /** Caret index (end of the token). */
  end: number
}

/** The token right before the caret, if the caret sits at the end of one. */
export function tokenAt(text: string, caret: number, triggers: ('/' | '@')[]): SuggestToken | null {
  const before = text.slice(0, caret)
  const m = /(^|\s)([/@])([\w.-]*)$/.exec(before)
  if (!m) return null
  const trigger = m[2] as '/' | '@'
  if (!triggers.includes(trigger)) return null
  const query = m[3] ?? ''
  return { trigger, query, start: caret - query.length - 1, end: caret }
}

/** Replace a token with text; returns the new value and where the caret goes. */
export function replaceToken(text: string, token: SuggestToken, insert: string) {
  const value = text.slice(0, token.start) + insert + text.slice(token.end)
  return { value, caret: token.start + insert.length }
}

/** Wrap the selection in markers (bold, code …), or insert them around the caret. */
export function wrapSelection(text: string, from: number, to: number, left: string, right = left) {
  const value = text.slice(0, from) + left + text.slice(from, to) + right + text.slice(to)
  return { value, from: from + left.length, to: to + left.length }
}

/** Prefix the current line(s) — bullet or numbered list. */
export function prefixLines(text: string, from: number, to: number, prefix: (i: number) => string) {
  const lineStart = text.lastIndexOf('\n', from - 1) + 1
  const lines = text.slice(lineStart, to).split('\n')
  const block = lines.map((l, i) => prefix(i) + l).join('\n')
  const value = text.slice(0, lineStart) + block + text.slice(to)
  return { value, caret: lineStart + block.length }
}
