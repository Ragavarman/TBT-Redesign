import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { Avatar, Button, Icon, IconButton, Input, Kbd } from '@/components/atoms'
import { Select } from '@/components/molecules'
import { menuItem, menuLabel, menuShortcut } from '@/components/ui/menu-styles'
import { cn } from '@/lib/utils'
import { formatBytes } from '@/types'
import { prefixLines, replaceToken, tokenAt, wrapSelection, type SuggestToken } from './suggest'

export type ComposerMode = 'reply' | 'note' | 'call'

export interface CannedReply {
  id: string
  /** Typed after "/", e.g. "printer". */
  shortcut: string
  title: string
  body: string
}

export interface Mentionable {
  id: string
  name: string
  /** "Technical Beta", "team". */
  meta?: string
  kind: 'agent' | 'team'
}

export interface ComposerAttachment {
  id: string
  name: string
  size: number
}

export type ComposerSubmit =
  | {
      mode: 'reply'
      body: string
      cc: string
      bcc: string
      attachments: ComposerAttachment[]
      /** "Send & set Waiting" — also move the ticket to Waiting for customer. */
      setWaiting: boolean
    }
  | { mode: 'note'; body: string; mentions: Mentionable[] }
  | { mode: 'call'; body: string; direction: 'outbound' | 'inbound'; duration: string }

export interface ComposerProps extends Omit<ComponentProps<'section'>, 'onSubmit'> {
  mode: ComposerMode
  onModeChange: (mode: ComposerMode) => void
  /** Reply recipient, e.g. "Dennis D. <dennis@caller.example>". */
  to: string
  cannedReplies: CannedReply[]
  /** Teammates and teams for @mentions in notes. */
  mentionables: Mentionable[]
  /** "Signature: Team Lead". */
  signature?: string
  onSubmit: (payload: ComposerSubmit) => void
  /** Esc with no menu open, or the × — the draft is kept. */
  onClose: () => void
  /** Open with this text in the opening mode (e.g. "/" from the canned-reply shortcut). */
  initialText?: string
}

const MODES: { value: ComposerMode; label: string }[] = [
  { value: 'reply', label: 'Reply' },
  { value: 'note', label: 'Note' },
  { value: 'call', label: 'Call log' },
]

const isMac = typeof navigator !== 'undefined' && /Mac|iP(hone|ad)/.test(navigator.platform)

/**
 * The open reply area (Figma Interface · X6 Email reply expanded, X7 Internal note @mention).
 * Reply: To / Cc / Bcc, formatting, "/" canned replies, attachments, Send or Send & set Waiting.
 * Note: "@" mentions, agents only. Call log: direction, duration, notes.
 * ⌘/Ctrl + Enter sends; Esc closes (the draft stays).
 */
export function Composer({
  mode,
  onModeChange,
  to,
  cannedReplies,
  mentionables,
  signature,
  onSubmit,
  onClose,
  initialText = '',
  className,
  ...props
}: ComposerProps) {
  const id = useId()
  const area = useRef<HTMLTextAreaElement>(null)
  const files = useRef<HTMLInputElement>(null)
  const [expanded, setExpanded] = useState(false)
  // one draft per mode, so switching tabs never loses text
  const [drafts, setDrafts] = useState<Record<ComposerMode, string>>(() => ({
    reply: '',
    note: '',
    call: '',
    [mode]: initialText,
  }))
  const [caret, setCaret] = useState(initialText.length)
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [showCc, setShowCc] = useState(false)
  const [showBcc, setShowBcc] = useState(false)
  const [attachments, setAttachments] = useState<ComposerAttachment[]>([])
  const [mentions, setMentions] = useState<Mentionable[]>([])
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound')
  const [duration, setDuration] = useState('')
  const [dismissed, setDismissed] = useState<number | null>(null)
  const [active, setActive] = useState(0)

  const text = drafts[mode]
  const setText = (v: string) => setDrafts((d) => ({ ...d, [mode]: v }))

  // focus the text on open and on every tab switch, caret at the end
  useEffect(() => {
    const el = area.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
    setCaret(el.value.length)
  }, [mode])

  /* ── "/" and "@" suggestions ─────────────────────────────────────────────────────── */

  const triggers: ('/' | '@')[] = mode === 'reply' ? ['/'] : mode === 'note' ? ['@'] : []
  const raw = tokenAt(text, caret, triggers)
  const token: SuggestToken | null = raw && raw.start !== dismissed ? raw : null
  const q = token?.query.toLowerCase() ?? ''
  const suggestions =
    token?.trigger === '/'
      ? cannedReplies
          .filter((c) => `${c.shortcut} ${c.title}`.toLowerCase().includes(q))
          .map((c) => ({
            id: c.id,
            label: c.title,
            meta: `/${c.shortcut}`,
            icon: <Icon name="chat" size={14} />,
            insert: c.body,
          }))
      : token?.trigger === '@'
        ? mentionables
            .filter((m) => m.name.toLowerCase().includes(q))
            .map((m) => ({
              id: m.id,
              label: m.name,
              meta: m.meta,
              icon:
                m.kind === 'team' ? (
                  <Icon name="team" size={14} />
                ) : (
                  <Avatar name={m.name} size="xs" aria-hidden />
                ),
              insert: `@${m.name} `,
              mention: m,
            }))
        : []
  const menuOpen = token !== null && suggestions.length > 0
  const activeIndex = Math.min(active, suggestions.length - 1)

  const place = (value: string, at: number, end = at) => {
    setText(value)
    requestAnimationFrame(() => {
      area.current?.focus()
      area.current?.setSelectionRange(at, end)
      setCaret(end)
    })
  }

  const accept = (i: number) => {
    const s = suggestions[i]
    if (!s || !token) return
    const { value, caret: at } = replaceToken(text, token, s.insert)
    if ('mention' in s && s.mention) setMentions((m) => [...m, s.mention!])
    setActive(0)
    place(value, at)
  }

  /* ── Formatting (markdown in the text) ───────────────────────────────────────────── */

  const sel = () =>
    [area.current?.selectionStart ?? caret, area.current?.selectionEnd ?? caret] as const
  const wrap = (l: string, r = l) => {
    const [a, b] = sel()
    const { value, from, to: end } = wrapSelection(text, a, b, l, r)
    place(value, from, end)
  }
  const lines = (prefix: (i: number) => string) => {
    const [a, b] = sel()
    const { value, caret: at } = prefixLines(text, a, b, prefix)
    place(value, at)
  }
  const insertAtCaret = (s: string) => {
    const [a, b] = sel()
    place(text.slice(0, a) + s + text.slice(b), a + s.length)
  }

  /* ── Submit ──────────────────────────────────────────────────────────────────────── */

  const canSend = text.trim().length > 0
  const submit = (setWaiting = false) => {
    if (!canSend) return
    const body = text.trim()
    if (mode === 'reply') onSubmit({ mode, body, cc, bcc, attachments, setWaiting })
    else if (mode === 'note')
      onSubmit({ mode, body, mentions: mentions.filter((m) => body.includes(`@${m.name}`)) })
    else onSubmit({ mode, body, direction, duration })
    setText('')
    if (mode === 'reply') setAttachments([])
    if (mode === 'note') setMentions([])
  }

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (menuOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const n = suggestions.length
        setActive((activeIndex + (e.key === 'ArrowDown' ? 1 : n - 1)) % n)
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        accept(activeIndex)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setDismissed(token.start)
        return
      }
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      submit()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if ((e.metaKey || e.ctrlKey) && !e.shiftKey && mode === 'reply') {
      const k = e.key.toLowerCase()
      if (k === 'b' || k === 'i' || k === 'e') {
        e.preventDefault()
        wrap(k === 'b' ? '**' : k === 'i' ? '_' : '`')
      }
    }
  }

  const mod = isMac ? '⌘' : 'Ctrl'

  return (
    <section
      aria-label="Compose"
      data-slot="composer"
      data-mode={mode}
      className={cn(
        'relative flex flex-col rounded-xl border bg-card text-card-foreground shadow-overlay',
        mode === 'note' && 'border-info/40',
        className,
      )}
      {...props}
    >
      {/* suggestion menu, above the composer like Figma */}
      {menuOpen && (
        <div
          id={`${id}-menu`}
          role="listbox"
          aria-label={token.trigger === '/' ? 'Canned replies' : 'Mention a teammate'}
          className="absolute bottom-full left-3 z-20 mb-2 flex w-80 flex-col rounded-md border bg-popover p-1 text-popover-foreground shadow-overlay"
        >
          <div className={menuLabel}>
            {token.trigger === '/'
              ? token.query
                ? `Canned replies matching “${token.query}”`
                : 'Canned replies'
              : 'Mention a teammate'}
          </div>
          {suggestions.map((s, i) => (
            <div
              key={s.id}
              id={`${id}-sug-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              data-highlighted={i === activeIndex ? '' : undefined}
              onMouseMove={() => i !== activeIndex && setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => accept(i)}
              className={menuItem}
            >
              {s.icon}
              <span className="min-w-0 flex-1 truncate">{s.label}</span>
              {s.meta && <span className={menuShortcut}>{s.meta}</span>}
            </div>
          ))}
          <div className="mt-1 flex items-center gap-1.5 border-t px-2 pt-2 pb-1 text-caption text-muted-foreground">
            <Kbd>↵</Kbd> insert <Kbd>Esc</Kbd> close
          </div>
        </div>
      )}

      {/* mode tabs */}
      <div className="flex items-center gap-1 border-b px-2 py-1.5">
        <div role="tablist" aria-label="Compose as" className="flex items-center gap-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              role="tab"
              aria-selected={mode === m.value}
              onClick={() => onModeChange(m.value)}
              className={cn(
                'rounded-sm px-2.5 py-1 text-label text-muted-foreground outline-none',
                'hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
                'aria-selected:bg-accent aria-selected:text-foreground',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        <IconButton
          icon="expand"
          label={expanded ? 'Shrink' : 'Expand'}
          size="sm"
          selected={expanded}
          onClick={() => setExpanded((v) => !v)}
        />
        <IconButton icon="x" label="Close (draft is kept)" size="sm" onClick={onClose} />
      </div>

      {/* reply: recipients + formatting */}
      {mode === 'reply' && (
        <>
          <div className="flex min-h-10 items-center gap-3 border-b px-3 text-body">
            <span className="w-8 shrink-0 text-small text-muted-foreground">To</span>
            <span className="min-w-0 flex-1 truncate text-foreground">{to}</span>
            {!showCc && (
              <Button variant="ghost" size="sm" onClick={() => setShowCc(true)}>
                Cc
              </Button>
            )}
            {!showBcc && (
              <Button variant="ghost" size="sm" onClick={() => setShowBcc(true)}>
                Bcc
              </Button>
            )}
          </div>
          {showCc && (
            <RecipientRow
              label="Cc"
              value={cc}
              onChange={setCc}
              onRemove={() => setShowCc(false)}
            />
          )}
          {showBcc && (
            <RecipientRow
              label="Bcc"
              value={bcc}
              onChange={setBcc}
              onRemove={() => setShowBcc(false)}
            />
          )}
          <div
            role="toolbar"
            aria-label="Formatting"
            className="flex items-center gap-0.5 border-b px-2 py-1"
          >
            <FormatButton label={`Bold (${mod}+B)`} onClick={() => wrap('**')}>
              <span className="font-bold">B</span>
            </FormatButton>
            <FormatButton label={`Italic (${mod}+I)`} onClick={() => wrap('_')}>
              <span className="italic">I</span>
            </FormatButton>
            <FormatButton label="Underline" onClick={() => wrap('<u>', '</u>')}>
              <span className="underline">U</span>
            </FormatButton>
            <FormatButton label="Bulleted list" onClick={() => lines(() => '• ')}>
              •
            </FormatButton>
            <FormatButton label="Numbered list" onClick={() => lines((i) => `${i + 1}. `)}>
              1.
            </FormatButton>
            <FormatButton label="Link" onClick={() => wrap('[', '](https://)')}>
              Link
            </FormatButton>
            <FormatButton label="Image" onClick={() => files.current?.click()}>
              Image
            </FormatButton>
            <FormatButton label={`Code (${mod}+E)`} onClick={() => wrap('`')}>
              Code
            </FormatButton>
          </div>
        </>
      )}

      {/* call log fields */}
      {mode === 'call' && (
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Select
            size="sm"
            aria-label="Direction"
            value={direction}
            onValueChange={(v) => setDirection(v as 'outbound' | 'inbound')}
            options={[
              { value: 'outbound', label: 'Outbound call' },
              { value: 'inbound', label: 'Inbound call' },
            ]}
            className="w-40"
          />
          <Input
            size="sm"
            aria-label="Duration"
            placeholder="Duration, e.g. 3:12"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            wrapperClassName="w-44"
          />
        </div>
      )}

      {/* the text */}
      <div className="flex flex-col gap-2 px-3 py-3">
        <textarea
          ref={area}
          aria-label={mode === 'reply' ? 'Reply' : mode === 'note' ? 'Internal note' : 'Call notes'}
          aria-autocomplete={triggers.length ? 'list' : undefined}
          aria-controls={menuOpen ? `${id}-menu` : undefined}
          aria-activedescendant={menuOpen ? `${id}-sug-${activeIndex}` : undefined}
          value={text}
          placeholder={
            mode === 'reply'
              ? 'Write a reply… Type / for canned replies'
              : mode === 'note'
                ? 'Add a note for your team… Type @ to mention'
                : 'What was the call about?'
          }
          onChange={(e) => {
            setText(e.target.value)
            setCaret(e.target.selectionStart)
            setActive(0)
          }}
          onSelect={(e) => setCaret(e.currentTarget.selectionStart)}
          onKeyDown={onKeyDown}
          className={cn(
            'field-sizing-content w-full resize-none bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground',
            expanded ? 'min-h-72' : 'min-h-16',
            'max-h-[50vh]',
          )}
        />
        {mode === 'reply' && attachments.length > 0 && (
          <ul aria-label="Attachments" className="flex flex-wrap gap-2">
            {attachments.map((a) => (
              <li
                key={a.id}
                className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-small text-foreground"
              >
                <Icon name="paperclip" size={14} className="text-muted-foreground" />
                {a.name} · {formatBytes(a.size)}
                <IconButton
                  icon="x"
                  label={`Remove ${a.name}`}
                  size="sm"
                  className="-me-1.5 size-6"
                  onClick={() => setAttachments((list) => list.filter((x) => x.id !== a.id))}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* footer */}
      <div className="flex items-center gap-2 border-t px-3 py-2">
        {mode === 'reply' && (
          <>
            <input
              ref={files}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const picked = [...(e.target.files ?? [])].map((f) => ({
                  id: `${f.name}-${f.size}-${f.lastModified}`,
                  name: f.name,
                  size: f.size,
                }))
                setAttachments((list) => [...list, ...picked])
                e.target.value = ''
              }}
            />
            <IconButton
              icon="paperclip"
              label="Attach files"
              size="sm"
              onClick={() => files.current?.click()}
            />
            <IconButton
              icon="chat"
              label="Canned reply (/)"
              size="sm"
              onClick={() => insertAtCaret('/')}
            />
            {signature && (
              <span className="min-w-0 truncate text-small text-muted-foreground">{signature}</span>
            )}
          </>
        )}
        {mode === 'note' && (
          <span className="flex items-center gap-1.5 text-small text-muted-foreground">
            <Icon name="lock" size={14} /> Only agents can see notes
          </span>
        )}
        {mode === 'call' && (
          <span className="flex items-center gap-1.5 text-small text-muted-foreground">
            <Icon name="phone" size={14} /> Logged on the ticket timeline
          </span>
        )}
        <span className="flex-1" />
        <span className="hidden text-caption text-muted-foreground lg:inline">
          <Kbd>{mod}</Kbd> <Kbd>↵</Kbd>
        </span>
        {mode === 'reply' && (
          <Button variant="secondary" size="sm" disabled={!canSend} onClick={() => submit(true)}>
            Send &amp; set Waiting
          </Button>
        )}
        <Button size="sm" disabled={!canSend} onClick={() => submit()}>
          {mode === 'reply' ? 'Send' : mode === 'note' ? 'Add note' : 'Log call'}
        </Button>
      </div>
    </section>
  )
}

function RecipientRow({
  label,
  value,
  onChange,
  onRemove,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  onRemove: () => void
}) {
  return (
    <div className="flex min-h-10 items-center gap-3 border-b px-3">
      <span className="w-8 shrink-0 text-small text-muted-foreground">{label}</span>
      <input
        aria-label={label}
        type="email"
        multiple
        autoFocus
        placeholder="name@example.com"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 min-w-0 flex-1 bg-transparent text-body text-foreground outline-none placeholder:text-muted-foreground"
      />
      <IconButton icon="x" label={`Remove ${label}`} size="sm" onClick={onRemove} />
    </div>
  )
}

function FormatButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="inline-flex h-7 min-w-7 cursor-pointer items-center justify-center rounded-xs px-1.5 text-small text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      {children}
    </button>
  )
}
