import { Button, Kbd } from '@/components/atoms'
import { Dialog, DialogClose } from '@/components/organisms'
import { SHORTCUTS } from '@/mocks'

/** Figma X13 · Keyboard shortcuts — press ? anywhere. */
export function ShortcutsDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Keyboard shortcuts"
      description="Press ? anywhere to open this list."
      footer={
        <DialogClose asChild>
          <Button>Done</Button>
        </DialogClose>
      }
    >
      <div className="grid grid-cols-2 gap-6">
        {SHORTCUTS.map((g) => (
          <section key={g.title} className="flex flex-col">
            <h3 className="pb-1 text-small text-muted-foreground">{g.title}</h3>
            <ul>
              {g.items.map((s) => (
                <li
                  key={s.label}
                  className="flex h-9 items-center justify-between gap-3 border-b text-body last:border-b-0"
                >
                  <span className="text-foreground">{s.label}</span>
                  <span className="flex gap-1">
                    {s.keys.map((k) => (
                      <Kbd key={k}>{k}</Kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Dialog>
  )
}
