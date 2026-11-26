/** Minimal CSV parsing: quoted fields, escaped quotes, commas and new lines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') {
      row.push(field)
      field = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(field)
      if (row.some((c) => c.trim() !== '')) rows.push(row)
      row = []
      field = ''
    } else field += ch
  }
  row.push(field)
  if (row.some((c) => c.trim() !== '')) rows.push(row)
  return rows
}

/** Guess which field a column header means ("device_name" → "name"). */
export function guessField(
  header: string,
  fields: { value: string; label: string; aliases?: string[] }[],
) {
  const h = header.toLowerCase().replace(/[^a-z]/g, '')
  return fields.find((f) =>
    [f.value, f.label, ...(f.aliases ?? [])].some((n) => {
      const x = n.toLowerCase().replace(/[^a-z]/g, '')
      return x === h || h.includes(x) || x.includes(h)
    }),
  )?.value
}
