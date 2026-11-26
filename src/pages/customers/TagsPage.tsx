import { useState, type ReactNode } from 'react'
import { Button, Icon } from '@/components/atoms'
import { toast } from '@/components/molecules'
import { PageHeader, TagDialog, TagPreview, type TagFormValues } from '@/components/organisms'
import { ListPageTemplate } from '@/components/templates'
import type { CustomerTagDef } from '@/mocks'

/**
 * Customers › Tags: every customer tag with its style, description and how many customers carry
 * it. A row opens Edit tag (Figma Interface · C5); New tag creates one.
 */

export interface TagsPageProps {
  sidebar: ReactNode
  tags: CustomerTagDef[]
  /** Customers per tag name. */
  usage: Record<string, number>
  onSave: (tag: CustomerTagDef, previousName?: string) => void
  onDelete: (id: string) => void
  /** Stories: open this tag's dialog on load. */
  initialEditId?: string
}

export function TagsPage({ sidebar, tags, usage, onSave, onDelete, initialEditId }: TagsPageProps) {
  // undefined = closed, null = new, id = edit
  const [editing, setEditing] = useState<string | null | undefined>(initialEditId)
  const tag = editing ? tags.find((t) => t.id === editing) : undefined

  const save = (v: TagFormValues) => {
    const next: CustomerTagDef = {
      id: tag?.id ?? `tg-${Date.now().toString(36)}`,
      name: v.name,
      description: v.description,
      style: v.style,
      showOnTickets: v.showOnTickets,
      autoRule: v.auto ? (tag?.autoRule ?? 'Added by an auto-routing rule') : undefined,
    }
    onSave(next, tag?.name)
    toast.success(tag ? `Saved “${v.name}”` : `Created “${v.name}”`)
  }

  return (
    <ListPageTemplate
      sidebar={sidebar}
      header={
        <PageHeader
          icon="knowledge"
          title="Tags"
          count={tags.length}
          actions={
            <Button leadingIcon="plus" onClick={() => setEditing(null)}>
              New tag
            </Button>
          }
        />
      }
    >
      <table className="w-full text-left text-body">
        <thead className="border-b text-small text-muted-foreground">
          <tr>
            <th className="h-10 ps-4 font-normal">Tag</th>
            <th className="font-normal">Description</th>
            <th className="w-28 font-normal">Customers</th>
            <th className="w-36 font-normal">On tickets</th>
            <th className="w-40 pe-4 font-normal">Automatic</th>
          </tr>
        </thead>
        <tbody>
          {tags.map((t) => (
            <tr
              key={t.id}
              tabIndex={0}
              onClick={() => setEditing(t.id)}
              onKeyDown={(e) =>
                (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), setEditing(t.id))
              }
              className="cursor-pointer border-b transition-colors duration-150 outline-none hover:bg-accent focus-visible:bg-accent"
            >
              <td className="h-11 ps-4">
                <TagPreview name={t.name} style={t.style} />
              </td>
              <td className="text-muted-foreground">{t.description || '—'}</td>
              <td className="tabular-nums">{usage[t.name] ?? 0}</td>
              <td className="text-muted-foreground">{t.showOnTickets ? 'Shown' : 'Hidden'}</td>
              <td className="pe-4 text-muted-foreground">
                {t.autoRule ? (
                  <span className="flex items-center gap-1.5">
                    <Icon name="sparkle" size={14} /> Rule
                  </span>
                ) : (
                  'Manual'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <TagDialog
        key={editing === undefined ? 'closed' : (editing ?? 'new')}
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
        mode={tag ? 'edit' : 'add'}
        initial={
          tag
            ? {
                name: tag.name,
                description: tag.description,
                style: tag.style,
                showOnTickets: tag.showOnTickets,
                auto: !!tag.autoRule,
              }
            : undefined
        }
        usage={tag ? (usage[tag.name] ?? 0) : 0}
        autoRule={tag?.autoRule}
        takenNames={tags.map((t) => t.name)}
        onSave={save}
        onDelete={
          tag
            ? () => {
                onDelete(tag.id)
                toast.success(`Deleted “${tag.name}”`)
              }
            : undefined
        }
      />
    </ListPageTemplate>
  )
}
