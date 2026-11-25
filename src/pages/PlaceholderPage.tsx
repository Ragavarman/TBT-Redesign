import type { ReactNode } from 'react'
import type { IconName } from '@/components/atoms'
import { EmptyState } from '@/components/molecules'
import { PageHeader } from '@/components/organisms'
import { ListPageTemplate } from '@/components/templates'

/** Stand-in for a screen that hasn't been built yet, so every sidebar link lands somewhere. */
export function PlaceholderPage({
  sidebar,
  title,
  icon,
  count,
}: {
  sidebar: ReactNode
  title: string
  icon?: IconName
  count?: ReactNode
}) {
  return (
    <ListPageTemplate
      sidebar={sidebar}
      header={<PageHeader icon={icon} title={title} count={count} />}
    >
      <div className="flex h-full items-center justify-center p-6">
        <EmptyState
          title={`${title} isn’t built yet`}
          description="This screen is coming in a later step."
        />
      </div>
    </ListPageTemplate>
  )
}
