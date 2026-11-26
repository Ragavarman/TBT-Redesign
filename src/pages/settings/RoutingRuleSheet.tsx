import { useState } from 'react'
import { Button, Icon, IconButton, Input, Switch } from '@/components/atoms'
import { FormField, Select } from '@/components/molecules'
import { ConfirmationModal, Sheet, SheetClose } from '@/components/organisms'
import {
  RULE_ACTIONS,
  RULE_FIELDS,
  RULE_OPS,
  type RoutingRule,
  type RuleAction,
  type RuleCondition,
} from '@/mocks'

const opts = (xs: string[]) => xs.map((x) => ({ value: x, label: x }))

export interface RoutingRuleSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rule?: RoutingRule
  /** "Rule 1 of 5". */
  position: string
  /** Choices for each action kind. */
  choices: Record<string, string[]>
  onSave: (rule: Omit<RoutingRule, 'id' | 'matched30'>) => void
  onDelete?: () => void
}

/** Figma X21 · Edit routing rule — conditions, actions, a match preview and Active. */
export function RoutingRuleSheet({
  open,
  onOpenChange,
  rule,
  position,
  choices,
  onSave,
  onDelete,
}: RoutingRuleSheetProps) {
  const [name, setName] = useState(rule?.name ?? '')
  const [conditions, setConditions] = useState<RuleCondition[]>(
    rule
      ? rule.conditions
      : [{ field: 'Application', op: 'is', value: RULE_FIELDS.Application![0]! }],
  )
  const [actions, setActions] = useState<RuleAction[]>(
    rule?.actions ?? [{ kind: 'Assign to team', value: choices['Assign to team']?.[0] ?? '' }],
  )
  const [active, setActive] = useState(rule?.active ?? true)
  const [tried, setTried] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const setCond = (i: number, p: Partial<RuleCondition>) =>
    setConditions((cs) => cs.map((c, j) => (j === i ? { ...c, ...p } : c)))
  const setAct = (i: number, p: Partial<RuleAction>) =>
    setActions((as) => as.map((a, j) => (j === i ? { ...a, ...p } : a)))

  // a rough preview — fewer conditions match more tickets
  const preview =
    rule && JSON.stringify(rule.conditions) === JSON.stringify(conditions)
      ? rule.matched30
      : Math.max(3, 60 - conditions.length * 18)
  const nameError = tried && !name.trim() ? 'Enter a rule name' : undefined
  const save = () => {
    setTried(true)
    if (!name.trim() || !actions.length) return
    onSave({
      name: name.trim(),
      conditions,
      actions,
      active,
      fallback: conditions.length ? undefined : 'No other rule matched',
    })
    onOpenChange(false)
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={onOpenChange}
        title={rule ? 'Edit routing rule' : 'New routing rule'}
        description={position}
        footer={
          <>
            {onDelete && (
              <Button
                variant="ghost"
                className="me-auto text-destructive"
                onClick={() => setConfirming(true)}
              >
                Delete rule
              </Button>
            )}
            <SheetClose asChild>
              <Button variant="secondary">Cancel</Button>
            </SheetClose>
            <Button onClick={save}>Save</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <FormField label="Rule name" required error={nameError}>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </FormField>

          <fieldset className="flex flex-col gap-2 rounded-lg border p-3">
            <legend className="px-1 text-label text-foreground">
              When a ticket is created and
            </legend>
            {conditions.map((c, i) => (
              <div key={i} className="grid grid-cols-[1fr_6.5rem_1fr_auto] items-center gap-1.5">
                <Select
                  size="sm"
                  aria-label="Field"
                  value={c.field}
                  onValueChange={(field) => setCond(i, { field, value: RULE_FIELDS[field]![0]! })}
                  options={opts(Object.keys(RULE_FIELDS))}
                />
                <Select
                  size="sm"
                  aria-label="Operator"
                  value={c.op}
                  onValueChange={(op) => setCond(i, { op })}
                  options={opts(RULE_OPS)}
                />
                <Select
                  size="sm"
                  aria-label="Value"
                  value={c.value}
                  onValueChange={(value) => setCond(i, { value })}
                  options={opts(RULE_FIELDS[c.field] ?? [])}
                />
                <IconButton
                  icon="x"
                  size="sm"
                  variant="ghost"
                  label="Remove condition"
                  onClick={() => setConditions((cs) => cs.filter((_, j) => j !== i))}
                />
              </div>
            ))}
            {!conditions.length && (
              <p className="text-small text-muted-foreground">
                No conditions — this rule catches every ticket no earlier rule matched.
              </p>
            )}
            <Button
              variant="ghost"
              size="sm"
              leadingIcon="plus"
              className="self-start"
              onClick={() =>
                setConditions((cs) => [...cs, { field: 'Priority', op: 'is', value: 'Urgent' }])
              }
            >
              Add condition
            </Button>
          </fieldset>

          <fieldset className="flex flex-col gap-2 rounded-lg border p-3">
            <legend className="px-1 text-label text-foreground">Then</legend>
            {actions.map((a, i) => (
              <div key={i} className="grid grid-cols-[10rem_1fr_auto] items-center gap-1.5">
                <Select
                  size="sm"
                  aria-label="Action"
                  value={a.kind}
                  onValueChange={(kind) => setAct(i, { kind, value: choices[kind]?.[0] ?? '' })}
                  options={opts(RULE_ACTIONS)}
                />
                <Select
                  size="sm"
                  aria-label="Target"
                  value={a.value}
                  onValueChange={(value) => setAct(i, { value })}
                  options={opts(choices[a.kind] ?? [])}
                />
                <IconButton
                  icon="x"
                  size="sm"
                  variant="ghost"
                  label="Remove action"
                  disabled={actions.length === 1}
                  onClick={() => setActions((as) => as.filter((_, j) => j !== i))}
                />
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              leadingIcon="plus"
              className="self-start"
              onClick={() =>
                setActions((as) => [...as, { kind: 'Notify', value: choices.Notify?.[0] ?? '' }])
              }
            >
              Add action
            </Button>
          </fieldset>

          <p className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 text-small text-muted-foreground">
            <Icon name="check" size={14} />
            Would have matched {preview} tickets in the last 30 days
          </p>
          <Switch checked={active} onCheckedChange={setActive} label="Rule is active" />
        </div>
      </Sheet>
      {onDelete && (
        <ConfirmationModal
          open={confirming}
          onOpenChange={setConfirming}
          variant="destructive"
          title="Delete rule?"
          description="Tickets it would have caught fall through to the next rule."
          confirmLabel="Delete rule"
          onConfirm={() => {
            onDelete()
            onOpenChange(false)
          }}
        />
      )}
    </>
  )
}
