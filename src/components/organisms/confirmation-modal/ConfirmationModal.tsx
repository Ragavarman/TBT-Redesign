import { useState, type ReactElement, type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button, Icon, type IconName } from '@/components/atoms'
import { cn } from '@/lib/utils'

export interface ConfirmationModalProps {
  /** default — confirm a significant action · destructive — irreversible (delete, remove). */
  variant?: 'default' | 'destructive'
  /** Question, e.g. "Delete 3 tickets?" (Heading 2). */
  title: ReactNode
  /** Consequence in plain words (Small, muted). */
  description: ReactNode
  /** Confirm button label — name the action, e.g. "Delete", "Close ticket". */
  confirmLabel: string
  cancelLabel?: string
  /**
   * Called on confirm. Return a promise to show a loading state; the modal closes when it
   * resolves and stays open (so the user can retry) if it rejects.
   */
  onConfirm: () => void | Promise<unknown>
  /** Override the icon (default: info · destructive: trash). */
  icon?: IconName | LucideIcon
  trigger?: ReactElement
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

/**
 * Confirm-before-acting modal (Figma 09 · Confirmation modal). Uses role="alertdialog":
 * focus starts on Cancel and clicking the scrim does not dismiss it.
 */
export function ConfirmationModal({
  variant = 'default',
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  icon,
  trigger,
  open: openProp,
  defaultOpen,
  onOpenChange,
}: ConfirmationModalProps) {
  const [openState, setOpenState] = useState(defaultOpen ?? false)
  const open = openProp ?? openState
  const setOpen = (v: boolean) => {
    if (openProp === undefined) setOpenState(v)
    onOpenChange?.(v)
  }
  const [busy, setBusy] = useState(false)
  const destructive = variant === 'destructive'
  const glyph = icon ?? (destructive ? 'trash' : 'info')

  const confirm = async () => {
    const result = onConfirm()
    if (result instanceof Promise) {
      setBusy(true)
      try {
        await result
        setOpen(false)
      } catch {
        /* keep open so the user can retry; the caller shows the error (e.g. a toast) */
      } finally {
        setBusy(false)
      }
    } else {
      setOpen(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <div className="flex gap-3">
          <span
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-full',
              destructive ? 'bg-destructive-soft text-destructive' : 'bg-info-soft text-info',
            )}
          >
            {typeof glyph === 'string' ? (
              <Icon name={glyph} size={16} />
            ) : (
              <Icon icon={glyph} size={16} />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={busy}>
              {cancelLabel}
            </Button>
          </AlertDialogCancel>
          {/* Not AlertDialogAction: that closes immediately; we close after onConfirm settles. */}
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            loading={busy}
            onClick={confirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
