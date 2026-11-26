import { useEffect, type ReactNode } from 'react'
import { useBlocker } from 'react-router'
import { Button, Icon, Switch, type IconName } from '@/components/atoms'
import { Dialog, PageHeader } from '@/components/organisms'
import { SettingsTemplate } from '@/components/templates'
import { cn } from '@/lib/utils'

export interface SettingsPageProps {
  sidebar: ReactNode
  /** Header label (also the page heading unless `heading` is given). */
  title: string
  icon?: IconName
  description?: ReactNode
  /** Forms: Save changes in the header, Ctrl+S, and the leave-without-saving guard (X22). */
  form?: { dirty: boolean; onSave: () => void; onDiscard: () => void; changed?: string }
  /** List pages: header buttons (Add …). */
  actions?: ReactNode
  /** Overlays. */
  overlays?: ReactNode
  children: ReactNode
}

/** One settings page (Figma Interface · S1–S13): header, centred column, unsaved-changes guard. */
export function SettingsPage({
  sidebar,
  title,
  icon = 'settings',
  description,
  form,
  actions,
  overlays,
  children,
}: SettingsPageProps) {
  const dirty = !!form?.dirty
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && currentLocation.pathname !== nextLocation.pathname,
  )

  // Ctrl/⌘+S saves; closing the tab with changes asks the browser to confirm
  useEffect(() => {
    if (!form) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        if (form.dirty) form.onSave()
      }
    }
    const onUnload = (e: BeforeUnloadEvent) => {
      if (form.dirty) e.preventDefault()
    }
    document.addEventListener('keydown', onKey)
    window.addEventListener('beforeunload', onUnload)
    return () => {
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('beforeunload', onUnload)
    }
  }, [form])

  const header = (
    <PageHeader
      icon={icon}
      title={title}
      actions={
        <>
          {form && dirty && (
            <Button variant="ghost" onClick={form.onDiscard}>
              Discard
            </Button>
          )}
          {form && (
            <Button disabled={!dirty} onClick={form.onSave} shortcut="Ctrl S">
              Save changes
            </Button>
          )}
          {actions}
        </>
      }
    />
  )

  return (
    <SettingsTemplate sidebar={sidebar} header={header} title={title} description={description}>
      {children}
      {overlays}
      <Dialog
        open={blocker.state === 'blocked'}
        onOpenChange={(o) => !o && blocker.reset?.()}
        title="Leave without saving?"
        description={`You changed ${form?.changed ?? 'this page'}. These changes will be lost.`}
        footer={
          <>
            <Button
              variant="ghost"
              className="me-auto"
              onClick={() => {
                form?.onDiscard()
                blocker.proceed?.()
              }}
            >
              Discard changes
            </Button>
            <Button variant="secondary" onClick={() => blocker.reset?.()}>
              Keep editing
            </Button>
            <Button
              onClick={() => {
                form?.onSave()
                blocker.proceed?.()
              }}
            >
              Save and leave
            </Button>
          </>
        }
      >
        {null}
      </Dialog>
    </SettingsTemplate>
  )
}

export interface SettingsColumn<T> {
  label: string
  className?: string
  render: (row: T) => ReactNode
}

/** Bordered table inside a settings column (Figma settings lists). */
export function SettingsTable<T extends { id: string }>({
  rows,
  columns,
  onRowClick,
  empty = 'Nothing here yet',
}: {
  rows: T[]
  columns: SettingsColumn<T>[]
  onRowClick?: (row: T) => void
  empty?: string
}) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full table-fixed text-left text-body">
        <thead className="border-b bg-muted/40 text-small text-muted-foreground">
          <tr>
            {columns.map((c, i) => (
              <th key={i} className={cn('h-9 font-normal first:ps-4 last:pe-4', c.className)}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick && (() => onRowClick(r))}
              onKeyDown={
                onRowClick &&
                ((e) => e.key === 'Enter' && e.target === e.currentTarget && onRowClick(r))
              }
              className={cn(
                'border-b last:border-b-0',
                onRowClick && 'cursor-pointer outline-none hover:bg-accent focus-visible:bg-accent',
              )}
            >
              {columns.map((c, i) => (
                <td key={i} className={cn('h-11 truncate pe-3 first:ps-4 last:pe-4', c.className)}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td colSpan={columns.length} className="h-16 text-center text-muted-foreground">
                {empty}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

/** A label + description with a switch on the right, separated by rules (Figma toggle lists). */
export function ToggleRow({
  label,
  description,
  checked,
  onChange,
  badge,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (on: boolean) => void
  badge?: ReactNode
}) {
  return (
    <label className="col-span-full flex cursor-pointer items-center gap-3 border-t py-3 first:border-t-0 first:pt-0 last:pb-0">
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-body text-foreground">
          {label}
          {badge}
        </span>
        {description && <span className="text-small text-muted-foreground">{description}</span>}
      </span>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </label>
  )
}

/** Grey info strip under a list (Figma S7 footnote). */
export function Footnote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-small text-muted-foreground">
      <Icon name="clock" size={14} />
      {children}
    </p>
  )
}

/** Trailing "more" button on a list row. */
export function RowMenu({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      Edit
    </Button>
  )
}
