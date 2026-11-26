import type { ComponentProps, ReactNode } from 'react'
import { Icon, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'
import type { TicketAttachmentKind } from '@/types'

const KIND_ICON: Record<TicketAttachmentKind, IconName> = {
  image: 'paperclip',
  audio: 'phone',
  document: 'ticket',
  file: 'paperclip',
}

export interface AttachmentTileProps extends Omit<ComponentProps<'a'>, 'children'> {
  name: string
  kind: TicketAttachmentKind
  /** "1.2 MB · from Dennis". */
  meta: ReactNode
}

/**
 * File card in the Attachments tab (Figma Interface · T2 Attachments): a muted preview area
 * with the file-type icon, then name and size · source.
 */
export function AttachmentTile({ name, kind, meta, className, ...props }: AttachmentTileProps) {
  return (
    <a
      data-slot="attachment-tile"
      data-kind={kind}
      className={cn(
        'flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-lg border bg-card outline-none',
        'transition-colors duration-150 hover:border-ring/50 focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      {...props}
    >
      <span className="flex h-30 items-center justify-center bg-muted text-muted-foreground">
        <Icon name={KIND_ICON[kind]} size={20} />
      </span>
      <span className="flex min-w-0 flex-col gap-0.5 px-3 py-3">
        <span className="truncate text-body text-foreground">{name}</span>
        <span className="truncate text-small text-muted-foreground">{meta}</span>
      </span>
    </a>
  )
}
