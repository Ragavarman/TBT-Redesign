import type { ReactElement } from 'react'
import { Kbd, StatusGlyph } from '@/components/atoms'
import { PickerList } from '@/components/molecules'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { TICKET_STATUSES, type TicketStatus } from '@/types'
import { STATUS_PICKER_LABEL } from './status-labels'

export interface StatusPickerProps {
  status: TicketStatus
  onChange: (status: TicketStatus) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  /** What opens it — usually the Status value in the details card. */
  trigger: ReactElement
  /** Shortcut that opens it, shown in the footer. Default "S". */
  shortcut?: string
}

/**
 * Change a ticket's status (Figma Interface · X1 Status picker): search, the six statuses with
 * 1–6 shortcuts, current one checked.
 */
export function StatusPicker({
  status,
  onChange,
  open,
  onOpenChange,
  trigger,
  shortcut = 'S',
}: StatusPickerProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <PickerList
          label="Statuses"
          placeholder="Change status…"
          numberKeys
          options={TICKET_STATUSES.map((s, i) => ({
            value: s,
            label: STATUS_PICKER_LABEL[s],
            keywords: s,
            icon: <StatusGlyph status={s} label={null} />,
            selected: s === status,
            hint: i + 1,
          }))}
          onSelect={(v) => {
            onChange(v as TicketStatus)
            onOpenChange(false)
          }}
          footer={
            <>
              <Kbd>{shortcut}</Kbd> opens this menu from anywhere
            </>
          }
        />
      </PopoverContent>
    </Popover>
  )
}
