import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar, Badge, IconButton } from '@/components/atoms'
import {
  PriorityBadge,
  PropertyRow,
  SlaBadge,
  TicketStatusBadge,
  TimelineEvent,
} from '@/components/molecules'
import { ago, ticket, ticketEvents, tickets } from '@/mocks'
import { TicketBreadcrumb } from '../ticket-breadcrumb'
import { ActivityItem, InternalNote, LinkedTicketRow, PanelSection } from './TicketPanel'

const meta = {
  title: 'Organisms/TicketPanel',
  component: PanelSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PanelSection>

export default meta
type Story = StoryObj<typeof meta>

const linked = tickets.filter((t) => [4812, 4817].includes(t.id))

/**
 * The ticket side panel for #4821, assembled from the Figma 10 · Ticket panel parts:
 * breadcrumb, Properties (PropertyRows), Linked tickets, Activity.
 */
export const SidePanel: Story = {
  args: { title: '', children: null },
  render: () => (
    <aside className="flex w-80 flex-col rounded-xl border bg-card px-4">
      <div className="flex flex-col gap-1 border-b py-3">
        <TicketBreadcrumb
          ticketId={`#${ticket.id}`}
          status={ticket.status}
          source="Email · via Zendesk"
        />
        <h2 className="text-heading-2">{ticket.subject}</h2>
      </div>
      <PanelSection title="Properties">
        <PropertyRow label="Status">
          <TicketStatusBadge status={ticket.status} />
        </PropertyRow>
        <PropertyRow label="Priority">
          <PriorityBadge priority={ticket.priority} />
        </PropertyRow>
        <PropertyRow label="Assignee">
          <Avatar name={ticket.assignee!.name} size="sm" />
          {ticket.assignee!.name}
        </PropertyRow>
        <PropertyRow label="Requester">{ticket.requester.name}</PropertyRow>
        <PropertyRow label="Team">{ticket.team}</PropertyRow>
        <PropertyRow label="Tags">
          {ticket.tags.map((t) => (
            <Badge key={t} variant="outline" size="sm">
              {t}
            </Badge>
          ))}
        </PropertyRow>
        <PropertyRow label="SLA">
          <SlaBadge state={ticket.sla!.state}>{ticket.sla!.label}</SlaBadge>
        </PropertyRow>
      </PanelSection>
      <PanelSection
        title="Linked"
        action={<IconButton icon="plus" label="Link a ticket" size="sm" className="size-6" />}
      >
        {linked.map((t) => (
          <LinkedTicketRow
            key={t.id}
            href="#"
            status={t.status}
            title={`#${t.id} ${t.subject}`}
            timeLabel={ago(t.updatedAt).replace(' ago', '')}
          />
        ))}
      </PanelSection>
      <PanelSection title="Activity">
        <ul>
          <ActivityItem status="open" timeLabel="8:02 AM">
            Created from Zendesk
          </ActivityItem>
          <ActivityItem status="investigating" timeLabel="8:40 AM">
            Nila P. started investigating
          </ActivityItem>
          <ActivityItem status="waiting" timeLabel="10:41 AM">
            Waiting for customer reply
          </ActivityItem>
        </ul>
      </PanelSection>
    </aside>
  ),
}

/** Figma 10 · Internal note, inside the conversation feed. */
export const ConversationWithNote: Story = {
  args: { title: '', children: null },
  render: () => (
    <ol className="flex w-[35rem] flex-col">
      {ticketEvents.map((e, i) => {
        const last = i === ticketEvents.length - 1
        if (e.type === 'comment' && e.internal) {
          return (
            <li key={e.id} className="flex gap-3">
              {/* keep the timeline rail running past the note */}
              <div aria-hidden className="flex w-5 shrink-0 justify-center">
                <span className="w-px bg-border" />
              </div>
              <div className="min-w-0 flex-1 pb-4">
                <InternalNote author={e.actor!} timeLabel={ago(e.at)}>
                  {e.text}
                </InternalNote>
              </div>
            </li>
          )
        }
        return (
          <TimelineEvent
            key={e.id}
            type={e.type}
            actor={e.actor?.name}
            action={e.type === 'comment' ? 'replied' : e.text}
            target={
              e.status ? (
                <TicketStatusBadge status={e.status} />
              ) : e.assignee ? (
                e.assignee.name
              ) : undefined
            }
            time={ago(e.at)}
            timeTitle={e.at}
            last={last}
          >
            {e.type === 'comment' ? e.text : undefined}
          </TimelineEvent>
        )
      })}
    </ol>
  ),
}
