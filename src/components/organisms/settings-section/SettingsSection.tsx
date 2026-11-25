import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface SettingsSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  /** Group name (Body strong). */
  title: ReactNode
  /** One line under the title (Small, muted). */
  description?: ReactNode
  /** Top-right control, e.g. a Switch for the whole group or a "Reset" link. */
  action?: ReactNode
  /** Lay fields out in one column or two equal columns (Figma: two). Default 2. */
  columns?: 1 | 2
}

/**
 * Bordered group of settings fields (Figma Interface · Settings · Group): radius 10,
 * 16/20/20 padding, 12px between head and fields. Children are FormFields; with
 * `columns={2}` they pair up, and a field can span both with `className="col-span-full"`.
 */
export function SettingsSection({
  title,
  description,
  action,
  columns = 2,
  className,
  children,
  ...props
}: SettingsSectionProps) {
  return (
    <section
      data-slot="settings-section"
      className={cn('flex flex-col gap-3 rounded-lg border px-5 pt-4 pb-5', className)}
      {...props}
    >
      <header className="flex items-start gap-2">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 className="text-body-strong text-foreground">{title}</h2>
          {description && <p className="text-small text-muted-foreground">{description}</p>}
        </div>
        {action && <div className="-my-1.5 shrink-0">{action}</div>}
      </header>
      <div className={cn('grid items-start gap-3', columns === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
        {children}
      </div>
    </section>
  )
}
