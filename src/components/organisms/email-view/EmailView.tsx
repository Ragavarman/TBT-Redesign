import { useState, type ComponentProps, type ReactNode } from 'react'
import { Icon } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface EmailViewProps extends Omit<ComponentProps<'article'>, 'children'> {
  /** Header fields, in order — From, To, Date, Subject. */
  fields: { label: string; value: ReactNode }[]
  /** Body paragraphs. Line breaks inside a paragraph are kept. */
  body: string[]
  /** Earlier thread, hidden behind "Show quoted text". */
  quoted?: string[]
  /** Attachment chips: "voicemail.mp3 · 412 KB". */
  attachments?: { id: string; label: ReactNode; href?: string }[]
}

/**
 * The original email, as received (Figma Interface · T1 Original email): header fields,
 * body, a quoted-text toggle and attachment chips, in one bordered card.
 */
export function EmailView({
  fields,
  body,
  quoted,
  attachments = [],
  className,
  ...props
}: EmailViewProps) {
  const [showQuoted, setShowQuoted] = useState(false)
  return (
    <article
      data-slot="email-view"
      className={cn('overflow-hidden rounded-xl border bg-card text-card-foreground', className)}
      {...props}
    >
      <dl className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-2 gap-y-3 border-b px-4 py-5">
        {fields.map((f) => (
          <div key={f.label} className="contents">
            <dt className="text-small text-muted-foreground">{f.label}</dt>
            <dd className="min-w-0 truncate text-body text-foreground">{f.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-3 px-4 py-5">
        <div className="flex flex-col gap-3 text-body whitespace-pre-line text-foreground">
          {body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        {quoted && quoted.length > 0 && (
          <div className="flex flex-col gap-2">
            <button
              type="button"
              aria-expanded={showQuoted}
              onClick={() => setShowQuoted((v) => !v)}
              className="inline-flex w-fit items-center gap-1.5 rounded-sm bg-muted px-2 py-1 text-small text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon name="dots" size={14} />
              {showQuoted ? 'Hide quoted text' : 'Show quoted text'}
            </button>
            {showQuoted && (
              <blockquote className="flex flex-col gap-1 border-l-2 ps-3 text-small whitespace-pre-line text-muted-foreground">
                {quoted.map((q, i) => (
                  <p key={i}>{q}</p>
                ))}
              </blockquote>
            )}
          </div>
        )}
        {attachments.length > 0 && (
          <ul aria-label="Attachments" className="flex flex-wrap gap-2 pt-1">
            {attachments.map((a) => (
              <li key={a.id}>
                <a
                  href={a.href}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-small text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Icon name="paperclip" size={14} className="text-muted-foreground" />
                  {a.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  )
}
