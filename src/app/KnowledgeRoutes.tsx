import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { Badge, Button } from '@/components/atoms'
import { toast } from '@/components/molecules'
import { RecordSheet, type RecordValues } from '@/components/organisms'
import { CANNED_VARIABLES, FOLDER_VIEW, KNOWLEDGE_FOLDERS, type CannedReplyRecord } from '@/mocks'
import { ResourceListPage, PersonCell } from '@/pages/kit/ResourceListPage'
import { MessagesPage } from '@/pages/knowledge/MessagesPage'
import { NoteEditorPage } from '@/pages/knowledge/NoteEditorPage'
import { AppSidebar } from './AppSidebar'
import { newId } from './collections-context'
import { useCannedReplies, useNotes, useSms } from './stores'
import { ticketPath } from './nav'

const STATUSES = ['None', 'Waiting for customer', 'Resolved', 'Closed']

/** /knowledge/:view — Notes (and folder views), Canned replies, Messages (Figma K1, K3–K5). */
export function KnowledgeViewRoute({ view }: { view: string }) {
  const navigate = useNavigate()
  const notes = useNotes()
  const canned = useCannedReplies()
  const sms = useSms()
  const [editing, setEditing] = useState<string | null | undefined>(undefined)
  const sidebar = <AppSidebar />

  if (view === 'notes' || FOLDER_VIEW[view]) {
    const folder = FOLDER_VIEW[view]
    const rows = folder ? notes.items.filter((n) => n.folder === folder) : notes.items
    return (
      <ResourceListPage
        sidebar={sidebar}
        icon={folder ? 'layers' : 'knowledge'}
        title={folder ?? 'Notes'}
        rows={rows}
        getId={(n) => n.id}
        searchText={(n) => `${n.title} ${n.folder} ${n.body}`}
        searchPlaceholder="Search notes"
        onRowClick={(n) => navigate(`/knowledge/notes/${n.id}`)}
        actions={
          <Button
            leadingIcon="plus"
            onClick={() => {
              const id = newId('kn')
              notes.add({
                id,
                title: '',
                folder: folder ?? 'General',
                updatedBy: 'Team Lead',
                updated: 'Just now',
                usedIn: 0,
                body: '',
                published: false,
              })
              navigate(`/knowledge/notes/${id}`)
            }}
          >
            New note
          </Button>
        }
        columns={[
          {
            key: 'title',
            label: 'Title',
            sort: (n) => n.title,
            render: (n) => (
              <span className="flex items-center gap-2">
                {n.title || 'Untitled note'}
                {!n.published && <Badge variant="warning">Draft</Badge>}
              </span>
            ),
          },
          {
            key: 'folder',
            label: 'Folder',
            className: 'w-44',
            sort: (n) => n.folder,
            render: (n) => <span className="text-muted-foreground">{n.folder}</span>,
          },
          {
            key: 'by',
            label: 'Updated by',
            className: 'w-40',
            render: (n) => <PersonCell name={n.updatedBy} />,
          },
          {
            key: 'updated',
            label: 'Updated',
            className: 'w-28',
            render: (n) => <span className="text-muted-foreground">{n.updated}</span>,
          },
          {
            key: 'used',
            label: 'Used in',
            className: 'w-28',
            sort: (n) => n.usedIn,
            render: (n) => `${n.usedIn} tickets`,
          },
        ]}
        empty={{
          title: 'No notes in this folder',
          description: 'Notes you write here show up for every agent.',
        }}
      />
    )
  }

  if (view === 'canned') {
    const record = editing ? canned.items.find((c) => c.id === editing) : undefined
    const save = (v: RecordValues) => {
      const next: CannedReplyRecord = {
        id: record?.id ?? newId('cr'),
        name: String(v.name),
        shortcut: String(v.shortcut).replace(/^\//, ''),
        folder: String(v.folder),
        message: String(v.message),
        allTeams: !!v.allTeams,
        setStatus: v.setStatus && v.setStatus !== 'None' ? String(v.setStatus) : undefined,
        used: record?.used ?? 0,
        updated: 'Just now',
      }
      canned.upsert(next)
      toast.success(
        record
          ? `Saved “${next.name}”`
          : `“${next.name}” added — type /${next.shortcut} in a reply`,
      )
    }
    return (
      <ResourceListPage
        sidebar={sidebar}
        icon="chat"
        title="Canned replies"
        rows={canned.items}
        getId={(c) => c.id}
        searchText={(c) => `${c.name} ${c.shortcut} ${c.folder} ${c.message}`}
        searchPlaceholder="Search replies or /shortcuts"
        onRowClick={(c) => setEditing(c.id)}
        actions={
          <Button leadingIcon="plus" onClick={() => setEditing(null)}>
            New reply
          </Button>
        }
        columns={[
          { key: 'name', label: 'Name', sort: (c) => c.name, render: (c) => c.name },
          {
            key: 'shortcut',
            label: 'Shortcut',
            className: 'w-36',
            sort: (c) => c.shortcut,
            render: (c) => <Badge variant="neutral">/{c.shortcut}</Badge>,
          },
          {
            key: 'folder',
            label: 'Folder',
            className: 'w-44',
            sort: (c) => c.folder,
            render: (c) => <span className="text-muted-foreground">{c.folder}</span>,
          },
          {
            key: 'used',
            label: 'Used',
            className: 'w-24',
            sort: (c) => c.used,
            render: (c) => <span className="tabular-nums">{c.used}</span>,
          },
          {
            key: 'updated',
            label: 'Updated',
            className: 'w-28',
            render: (c) => <span className="text-muted-foreground">{c.updated}</span>,
          },
        ]}
      >
        <RecordSheet
          key={editing === undefined ? 'closed' : (editing ?? 'new')}
          open={editing !== undefined}
          onOpenChange={(o) => !o && setEditing(undefined)}
          title={record ? 'Edit canned reply' : 'New canned reply'}
          onSave={save}
          saveLabel="Save reply"
          deleteLabel="Delete reply"
          onDelete={
            record
              ? () => (canned.remove(record.id), toast.success(`Deleted “${record.name}”`))
              : undefined
          }
          initial={
            record
              ? {
                  ...record,
                  shortcut: `/${record.shortcut}`,
                  setStatus: record.setStatus ?? 'None',
                }
              : { folder: 'General', allTeams: true, setStatus: 'None' }
          }
          fields={[
            { name: 'name', label: 'Name', type: 'text', required: true },
            {
              name: 'shortcut',
              label: 'Shortcut',
              type: 'text',
              half: true,
              required: true,
              helper: 'Type it in the reply box',
              validate: (val) => {
                const s = String(val).replace(/^\//, '')
                if (!/^[a-z0-9-]+$/i.test(s)) return 'Letters, numbers and dashes only'
                if (canned.items.some((c) => c.shortcut === s && c.id !== record?.id))
                  return `/${s} is already used`
                return undefined
              },
            },
            {
              name: 'folder',
              label: 'Folder',
              type: 'select',
              half: true,
              options: KNOWLEDGE_FOLDERS,
            },
            { name: 'message', label: 'Message', type: 'textarea', rows: 7, required: true },
            {
              name: 'allTeams',
              label: 'Available to all teams',
              type: 'switch',
              helper: 'Otherwise only Support Team Alpha',
            },
            {
              name: 'setStatus',
              label: 'Set status after sending',
              type: 'select',
              options: STATUSES,
            },
          ]}
          after={{
            message: (insert) => (
              <div className="flex flex-wrap items-center gap-1.5 text-small text-muted-foreground">
                Insert:
                {CANNED_VARIABLES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insert(v)}
                    className="cursor-pointer rounded-xs border px-1.5 py-0.5 font-mono text-caption outline-none hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {v}
                  </button>
                ))}
              </div>
            ),
          }}
        />
      </ResourceListPage>
    )
  }

  if (view === 'messages') {
    return (
      <MessagesPage
        sidebar={sidebar}
        threads={sms.items}
        onRead={(id) => sms.update(id, { unread: false })}
        onSend={(id, text) => {
          const t = sms.items.find((x) => x.id === id)!
          sms.update(id, {
            last: 'now',
            messages: [
              ...t.messages,
              { id: newId('m'), from: 'agent', agent: 'Team Lead', time: 'now', text },
            ],
          })
        }}
        onNew={(phone, text) => {
          const id = newId('sm')
          sms.add({
            id,
            name: phone,
            phone,
            last: 'now',
            unread: false,
            messages: [{ id: 'a', from: 'agent', agent: 'Team Lead', time: 'now', text }],
          })
          return id
        }}
        onOpenTicket={(id) => navigate(ticketPath('all', id))}
      />
    )
  }
  return null
}

/** /knowledge/notes/:id — the note editor (Figma K2). */
export function NoteRoute({ id }: { id: string }) {
  const navigate = useNavigate()
  const notes = useNotes()
  const note = notes.items.find((n) => n.id === id)
  if (!note) return <Navigate to="/knowledge/notes" replace />
  return (
    <NoteEditorPage
      key={note.id}
      sidebar={<AppSidebar />}
      note={note}
      folders={KNOWLEDGE_FOLDERS}
      related={notes.items.filter((n) => n.id !== id && n.folder === note.folder).slice(0, 2)}
      onChange={(patch) => notes.update(id, patch)}
      onBack={() => navigate('/knowledge/notes')}
      onOpenNote={(nid) => navigate(`/knowledge/notes/${nid}`)}
    />
  )
}
