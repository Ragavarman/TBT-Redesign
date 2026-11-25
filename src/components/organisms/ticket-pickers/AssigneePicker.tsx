import type { ReactElement, ReactNode } from 'react'
import { Avatar, Icon, Kbd } from '@/components/atoms'
import { PickerList, type PickerOption } from '@/components/molecules'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { Agent } from '@/types'

const ME = '__me'
const NONE = '__none'
const TEAM = 'team:'

export interface AssigneePickerProps {
  /** Current assignee id; undefined = unassigned. */
  assigneeId?: string
  /** Current team. */
  team: string
  /** The signed-in agent ("Assign to me"). */
  me: Agent
  /** Agents on the team, with what to show at the end of the row ("online", "8 open"). */
  agents: { agent: Agent; meta?: ReactNode }[]
  /** Other teams the ticket can be handed to. */
  teams: string[]
  /** Pick an agent, or `undefined` for Unassigned. */
  onAssign: (agent: Agent | undefined) => void
  onTeamChange: (team: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger: ReactElement
  /** Global shortcut for "Assign to me", shown on that row. Default "A". */
  assignToMeShortcut?: string
  /** Shortcut that opens the picker, shown in the footer. Default "⇧A". */
  shortcut?: string
}

/**
 * Hand a ticket to someone (Figma Interface · X2 Assignee picker): Assign to me, Unassigned,
 * the team's agents with presence / load, then other teams. Type to search.
 */
export function AssigneePicker({
  assigneeId,
  team,
  me,
  agents,
  teams,
  onAssign,
  onTeamChange,
  open,
  onOpenChange,
  trigger,
  assignToMeShortcut = 'A',
  shortcut = '⇧A',
}: AssigneePickerProps) {
  const options: PickerOption[] = [
    {
      value: ME,
      label: 'Assign to me',
      icon: <Icon name="user" size={14} />,
      hint: assignToMeShortcut,
      keywords: me.name,
    },
    { value: NONE, label: 'Unassigned', icon: <Icon name="x" size={14} />, selected: !assigneeId },
    ...agents.map(({ agent, meta }) => ({
      value: agent.id,
      label: agent.name,
      group: `Agents · ${team}`,
      icon: <Avatar name={agent.name} src={agent.avatarUrl} size="xs" aria-hidden />,
      meta,
      selected: agent.id === assigneeId,
    })),
    ...teams
      .filter((t) => t !== team)
      .map((t) => ({
        value: TEAM + t,
        label: t,
        group: 'Teams',
        icon: <Icon name="team" size={14} />,
      })),
  ]

  const pick = (value: string) => {
    if (value === ME) onAssign(me)
    else if (value === NONE) onAssign(undefined)
    else if (value.startsWith(TEAM)) onTeamChange(value.slice(TEAM.length))
    else onAssign(agents.find((a) => a.agent.id === value)?.agent)
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <PickerList
          label="Assignees"
          placeholder="Assign to…"
          options={options}
          onSelect={pick}
          footer={
            <>
              <Kbd>{shortcut}</Kbd> opens this menu · <Kbd>{assignToMeShortcut}</Kbd> assigns to you
            </>
          }
        />
      </PopoverContent>
    </Popover>
  )
}
