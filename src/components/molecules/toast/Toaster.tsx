import type { ComponentProps } from 'react'
import { Toaster as Sonner } from 'sonner'
import { Icon, Spinner } from '@/components/atoms'
import { cn } from '@/lib/utils'

/**
 * Toast container (Figma 09 · Toast). Mount once near the app root, then call `toast.*()`.
 * Styled from scratch (sonner `unstyled`) so it uses TBT tokens in every mode / theme.
 *
 * ```tsx
 * <Toaster />
 * toast.success('Ticket #1042 closed', { description: 'Kavin S. will be notified.',
 *   action: { label: 'Undo', onClick: reopen } })
 * ```
 */
export function Toaster({ toastOptions, ...props }: ComponentProps<typeof Sonner>) {
  return (
    <Sonner
      position="bottom-right"
      gap={8}
      closeButton
      icons={{
        success: <Icon name="check" size={16} className="text-success" />,
        error: <Icon name="warning" size={16} className="text-destructive" />,
        info: <Icon name="info" size={16} className="text-info" />,
        warning: <Icon name="warning" size={16} className="text-warning" />,
        loading: <Spinner size="sm" label={null} className="text-muted-foreground" />,
        close: <Icon name="x" size={14} />,
      }}
      toastOptions={{
        unstyled: true,
        ...toastOptions,
        classNames: {
          toast: cn(
            'group/toast flex w-(--width) items-start gap-2.5 rounded-lg bg-popover py-3 pr-3 pl-3.5',
            'text-popover-foreground shadow-overlay ring-1 ring-border',
          ),
          icon: 'relative mt-0.5 flex size-4 shrink-0 items-center justify-center [&>*]:shrink-0',
          content: 'flex min-w-0 flex-1 flex-col gap-0.5',
          title: 'text-body-strong text-popover-foreground',
          description: 'text-small text-muted-foreground',
          actionButton:
            'mt-px shrink-0 cursor-pointer rounded-xs px-1 text-label text-foreground outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring',
          cancelButton:
            'mt-px shrink-0 cursor-pointer rounded-xs px-1 text-label text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          closeButton:
            'order-last mt-0.5 flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          ...toastOptions?.classNames,
        },
      }}
      style={{ '--width': '360px' } as React.CSSProperties}
      {...props}
    />
  )
}
