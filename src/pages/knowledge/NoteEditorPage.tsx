import { useRef, useState, type ReactNode } from 'react'
import { Avatar, Badge, Button, Icon } from '@/components/atoms'
import { Breadcrumb, Select, toast } from '@/components/molecules'
import { PageHeader } from '@/components/organisms'
import { AppShell, Panel, PanelBody } from '@/components/templates'
import { useHotkeys } from '@/hooks/useHotkeys'
import type { KnowledgeNote } from '@/mocks'

/**
 * Figma Interface · K2 Knowledge — Note editor: title, folder, meta, and a markdown body with a
 * formatting bar (Text, B, I, lists, link, callout) and a live preview of steps and callouts.
 * Saves as you type; Share copies a link; Publish makes it available in replies.
 */

export interface NoteEditorPageProps {
  sidebar: ReactNode
  note: KnowledgeNote
  folders: string[]
  /** "Reset a receipt printer…" and others, for the Related line. */
  related: KnowledgeNote[]
  onChange: (patch: Partial<KnowledgeNote>) => void
  onBack: () => void
  onOpenNote: (id: string) => void
}

/** Renders the note body: ## headings, numbered steps, > callouts, paragraphs. */
function Preview({ body }: { body: string }) {
  const blocks = body.split(/\n{2,}/)
  return (
    <div className="flex flex-col gap-4 text-body text-foreground">
      {blocks.map((b, i) => {
        const lines = b.split('\n')
        return (
          <div key={i} className="flex flex-col gap-3">
            {lines.map((l, j) => {
              if (l.startsWith('## '))
                return (
                  <h2 key={j} className="text-heading-2">
                    {l.slice(3)}
                  </h2>
                )
              const step = /^(\d+)\.\s+(.*)$/.exec(l)
              if (step)
                return (
                  <p key={j} className="flex items-start gap-3">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-caption tabular-nums">
                      {step[1]}
                    </span>
                    {step[2]}
                  </p>
                )
              if (l.startsWith('> '))
                return (
                  <p key={j} className="flex items-start gap-2 rounded-md bg-muted px-3 py-2.5">
                    <Icon name="star" size={14} className="mt-0.5 text-muted-foreground" />
                    {l.slice(2)}
                  </p>
                )
              if (l.startsWith('- ') || l.startsWith('• '))
                return (
                  <p key={j} className="flex items-start gap-2 ps-1">
                    <span aria-hidden>•</span>
                    {l.slice(2)}
                  </p>
                )
              return l ? (
                <p key={j} className="text-muted-foreground">
                  {l}
                </p>
              ) : null
            })}
          </div>
        )
      })}
    </div>
  )
}

export function NoteEditorPage({
  sidebar,
  note,
  folders,
  related,
  onChange,
  onBack,
  onOpenNote,
}: NoteEditorPageProps) {
  const body = useRef<HTMLTextAreaElement>(null)
  const [mode, setMode] = useState<'write' | 'preview'>('preview')
  const [saved, setSaved] = useState('Saved · 2m ago')
  const change = (patch: Partial<KnowledgeNote>) => {
    onChange({ ...patch, updated: 'Just now', updatedBy: 'Team Lead' })
    setSaved('Saved · just now')
  }

  /** Prefix or wrap the current selection in the body. */
  const format = (
    kind: 'heading' | 'bold' | 'italic' | 'bullet' | 'number' | 'link' | 'callout',
  ) => {
    setMode('write')
    requestAnimationFrame(() => {
      const el = body.current
      if (!el) return
      const { selectionStart: a, selectionEnd: b, value } = el
      const sel = value.slice(a, b)
      const lineStart = value.lastIndexOf('\n', a - 1) + 1
      const wrap = (l: string, r = l) => value.slice(0, a) + l + sel + r + value.slice(b)
      const prefix = (p: string) => value.slice(0, lineStart) + p + value.slice(lineStart)
      const next = {
        heading: prefix('## '),
        bold: wrap('**'),
        italic: wrap('_'),
        bullet: prefix('- '),
        number: prefix('1. '),
        link: wrap('[', '](https://)'),
        callout: prefix('> '),
      }[kind]
      change({ body: next })
      el.focus()
    })
  }

  useHotkeys({ escape: onBack, e: () => setMode('write') })

  return (
    <AppShell sidebar={sidebar}>
      <Panel>
        <PageHeader
          title={
            <Breadcrumb
              items={[
                { label: 'Notes', href: '#', onClick: (e) => (e.preventDefault(), onBack()) },
                { label: note.title || 'Untitled note' },
              ]}
            />
          }
          actions={
            <>
              <Button
                variant="secondary"
                leadingIcon="link"
                onClick={() => {
                  void navigator.clipboard?.writeText(
                    `${location.origin}/knowledge/notes/${note.id}`,
                  )
                  toast.success('Link copied')
                }}
              >
                Share
              </Button>
              <Button
                onClick={() => {
                  change({ published: !note.published })
                  toast.success(
                    note.published
                      ? 'Unpublished — only you can see it'
                      : 'Published — agents can use it in replies',
                  )
                }}
              >
                {note.published ? 'Unpublish' : 'Publish'}
              </Button>
            </>
          }
        />
        <div
          role="toolbar"
          aria-label="Formatting"
          className="flex shrink-0 items-center gap-0.5 border-b px-4 py-1.5"
        >
          {(
            [
              ['heading', 'Heading'],
              ['bold', 'B'],
              ['italic', 'I'],
              ['bullet', '• List'],
              ['number', '1. List'],
              ['link', 'Link'],
              ['callout', 'Callout'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => format(k)}
              className="h-7 cursor-pointer rounded-xs px-2 text-small text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              {label}
            </button>
          ))}
          <span className="flex-1" />
          <div role="tablist" aria-label="Mode" className="flex gap-0.5">
            {(['write', 'preview'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                className="h-7 cursor-pointer rounded-xs px-2 text-small text-muted-foreground capitalize outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-selected:bg-accent aria-selected:text-foreground"
              >
                {m}
              </button>
            ))}
          </div>
          <span className="ps-3 text-small text-muted-foreground" aria-live="polite">
            {saved}
          </span>
        </div>
        <PanelBody>
          <article className="mx-auto flex max-w-180 flex-col gap-4 px-6 py-8">
            <input
              aria-label="Title"
              value={note.title}
              placeholder="Untitled note"
              onChange={(e) => change({ title: e.target.value })}
              className="w-full bg-transparent text-heading-1 text-foreground outline-none placeholder:text-muted-foreground"
            />
            <div className="flex flex-wrap items-center gap-2 text-small text-muted-foreground">
              <Select
                size="sm"
                aria-label="Folder"
                value={note.folder}
                onValueChange={(folder) => change({ folder })}
                options={folders.map((f) => ({ value: f, label: f }))}
                className="w-44"
              />
              <Avatar name={note.updatedBy} size="xs" aria-hidden />
              {note.updatedBy} · edited {note.updated} · used in {note.usedIn} tickets
              {!note.published && <Badge variant="warning">Draft</Badge>}
            </div>
            {mode === 'write' ? (
              <textarea
                ref={body}
                aria-label="Note body"
                value={note.body}
                onChange={(e) => change({ body: e.target.value })}
                className="field-sizing-content min-h-80 w-full resize-none bg-transparent font-mono text-body text-foreground outline-none"
                placeholder="Write the steps… ## for a heading, 1. for steps, > for a callout"
              />
            ) : (
              <div onDoubleClick={() => setMode('write')}>
                <Preview body={note.body} />
              </div>
            )}
            {related.length > 0 && (
              <p className="pt-2 text-small text-muted-foreground">
                Related:{' '}
                {related.map((r, i) => (
                  <span key={r.id}>
                    {i > 0 && ' · '}
                    <button
                      type="button"
                      onClick={() => onOpenNote(r.id)}
                      className="cursor-pointer rounded-xs outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {r.title}
                    </button>
                  </span>
                ))}
              </p>
            )}
          </article>
        </PanelBody>
      </Panel>
    </AppShell>
  )
}
