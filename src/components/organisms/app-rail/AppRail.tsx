import type { ComponentProps, ReactNode } from 'react'
import { Avatar } from '@/components/atoms'
import { RailItem } from '@/components/molecules'
import { cn } from '@/lib/utils'
import type { NavUser, RailModule } from '../sub-navigation/types'

export interface AppRailProps extends Omit<ComponentProps<'nav'>, 'onSelect'> {
  /** Main modules (Inbox, Customers, Reports, Knowledge, Inventory, Team). */
  modules: RailModule[]
  /** Bottom group (Search, Notifications, Settings …). */
  footerModules?: RailModule[]
  activeId?: string
  onSelect?: (module: RailModule) => void
  /** Signed-in user, shown at the very bottom. */
  user?: NavUser
  /** Called when the user avatar is clicked (e.g. open the account menu). */
  onUserClick?: () => void
  /** Brand mark at the top. Default: a 28px primary tile with "T". */
  logo?: ReactNode
}

/**
 * Narrow module switcher (Figma 07 · App rail): logo · modules · spacer · footer modules · avatar.
 * 56px wide; labels appear as tooltips.
 */
export function AppRail({
  modules,
  footerModules = [],
  activeId,
  onSelect,
  user,
  onUserClick,
  logo,
  className,
  ...props
}: AppRailProps) {
  const item = (m: RailModule) => (
    <RailItem
      key={m.id}
      icon={m.icon}
      label={m.label}
      dot={m.dot}
      active={m.id === activeId}
      onClick={() => onSelect?.(m)}
    />
  )
  return (
    <nav
      data-slot="app-rail"
      aria-label="Modules"
      className={cn(
        'flex h-full w-14 shrink-0 flex-col items-center gap-1 bg-sidebar py-3',
        className,
      )}
      {...props}
    >
      {logo ?? (
        <span
          aria-hidden
          className="flex size-7 items-center justify-center rounded-md bg-primary text-title text-primary-foreground"
        >
          T
        </span>
      )}
      <span aria-hidden className="h-3 shrink-0" />
      {modules.map(item)}
      <span aria-hidden className="flex-1" />
      {footerModules.map(item)}
      {user && (
        <button
          type="button"
          aria-label={`Account: ${user.name}`}
          onClick={onUserClick}
          className="mt-1 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <Avatar
            name={user.name}
            src={user.avatarUrl}
            size="sm"
            presence={user.presence}
            aria-hidden
          />
        </button>
      )}
    </nav>
  )
}
