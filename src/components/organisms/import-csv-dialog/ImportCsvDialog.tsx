import { useState } from 'react'
import { Button, Icon } from '@/components/atoms'
import { Select } from '@/components/molecules'
import { formatBytes } from '@/types'
import { Dialog, DialogClose } from '../dialog'
import { guessField, parseCsv } from './parse-csv'

export interface ImportField {
  value: string
  label: string
  /** Other header names that mean this field. */
  aliases?: string[]
}

export interface ImportCsvDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** "items", "brands" — in the title and button. */
  noun: string
  fields: ImportField[]
  /** Rows missing this field are skipped. */
  requiredField: string
  /** Header row of the downloadable template. */
  template: string[]
  onImport: (rows: Record<string, string>[]) => void
}

const SKIP = '__skip'

/**
 * Import records from a CSV (Figma Interface · I9 Inventory — Import CSV): pick a file, match
 * each column to a field (guessed from the header), see how many rows are ready, import.
 */
export function ImportCsvDialog({
  open,
  onOpenChange,
  noun,
  fields,
  requiredField,
  template,
  onImport,
}: ImportCsvDialogProps) {
  const [file, setFile] = useState<{ name: string; size: number }>()
  const [rows, setRows] = useState<string[][]>([])
  const [map, setMap] = useState<string[]>([])
  const [error, setError] = useState<string>()

  const header = rows[0] ?? []
  const body = rows.slice(1)
  const reqIndex = map.indexOf(requiredField)
  const ready = reqIndex === -1 ? [] : body.filter((r) => (r[reqIndex] ?? '').trim())
  const reqLabel =
    fields.find((f) => f.value === requiredField)?.label.toLowerCase() ?? requiredField

  const read = (f: File) => {
    if (!/\.csv$/i.test(f.name)) return setError('Choose a .csv file')
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result ?? ''))
      if (parsed.length < 2) return setError('That file has no rows to import')
      setError(undefined)
      setFile({ name: f.name, size: f.size })
      setRows(parsed)
      setMap(parsed[0]!.map((h) => guessField(h, fields) ?? SKIP))
    }
    reader.readAsText(f)
  }

  const downloadTemplate = () => {
    const blob = new Blob([`${template.join(',')}\n`], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${noun}-template.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const reset = () => {
    setFile(undefined)
    setRows([])
    setMap([])
    setError(undefined)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) reset()
      }}
      title={`Import ${noun} from CSV`}
      description="Match each column in your file to a field. Rows with errors are skipped."
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            className="me-auto"
            leadingIcon="download"
            onClick={downloadTemplate}
          >
            Download template
          </Button>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button
            disabled={!ready.length}
            onClick={() => {
              onImport(
                ready.map((r) =>
                  Object.fromEntries(
                    map
                      .map((m, i) => [m, (r[i] ?? '').trim()] as const)
                      .filter(([m]) => m !== SKIP),
                  ),
                ),
              )
              onOpenChange(false)
              reset()
            }}
          >
            {ready.length ? `Import ${ready.length} ${noun}` : 'Import'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {!file ? (
          <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-8 text-center hover:bg-accent has-focus-visible:ring-2 has-focus-visible:ring-ring">
            <Icon name="upload" size={16} className="text-muted-foreground" />
            <span className="text-body text-foreground">
              Choose a CSV file or <span className="text-primary">browse</span>
            </span>
            <span className="text-small text-muted-foreground">
              The first row should be column names
            </span>
            <input
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => e.target.files?.[0] && read(e.target.files[0])}
            />
          </label>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
            <Icon name="paperclip" size={16} className="text-muted-foreground" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-body text-foreground">{file.name}</span>
              <span className="text-small text-muted-foreground">
                {body.length} rows · {header.length} columns · {formatBytes(file.size)}
              </span>
            </span>
            <Button variant="ghost" size="sm" onClick={reset}>
              Replace
            </Button>
          </div>
        )}
        {error && (
          <p role="alert" className="text-small text-destructive">
            {error}
          </p>
        )}
        {file && (
          <>
            <table className="w-full text-left text-body">
              <thead className="border-b text-small text-muted-foreground">
                <tr>
                  <th className="h-9 font-normal">Column in file</th>
                  <th className="font-normal">Example</th>
                  <th className="w-52 font-normal">Maps to</th>
                </tr>
              </thead>
              <tbody>
                {header.map((h, i) => (
                  <tr key={i} className="border-b last:border-b-0">
                    <td className="h-11 font-mono text-small">{h}</td>
                    <td className="max-w-48 truncate text-muted-foreground">
                      {body[0]?.[i] ?? ''}
                    </td>
                    <td>
                      <Select
                        size="sm"
                        aria-label={`Map ${h}`}
                        value={map[i] ?? SKIP}
                        onValueChange={(v) =>
                          setMap((m) =>
                            m.map((x, j) => (j === i ? v : x === v && v !== SKIP ? SKIP : x)),
                          )
                        }
                        options={[...fields, { value: SKIP, label: 'Don’t import' }]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="flex items-center gap-2 rounded-md bg-muted px-4 py-3 text-small text-muted-foreground">
              <Icon name={ready.length ? 'check' : 'warning'} size={14} />
              {reqIndex === -1
                ? `Map a column to ${reqLabel} to import`
                : `${ready.length} rows ready${body.length - ready.length ? ` · ${body.length - ready.length} rows have no ${reqLabel}` : ''}`}
            </p>
          </>
        )}
      </div>
    </Dialog>
  )
}
