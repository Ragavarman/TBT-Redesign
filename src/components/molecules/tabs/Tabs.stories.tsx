import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs'

const meta = {
  title: 'Molecules/Tabs',
  component: Tabs,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

/** pill — view switchers in toolbars. */
export const Pill: Story = {
  render: () => (
    <Tabs defaultValue="todo">
      <TabsList aria-label="Ticket views">
        <TabsTrigger value="todo" count={8}>
          Todo
        </TabsTrigger>
        <TabsTrigger value="waiting" count={3}>
          Waiting
        </TabsTrigger>
        <TabsTrigger value="done" count={42}>
          Done
        </TabsTrigger>
        <TabsTrigger value="spam" disabled>
          Spam
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
}

/** underline — page-level sections, e.g. ticket Conversation / Details. */
export const Underline: Story = {
  render: () => (
    <Tabs defaultValue="conversation" className="w-[28rem]">
      <TabsList variant="underline" aria-label="Ticket sections" className="w-full">
        <TabsTrigger value="conversation" icon="chat">
          Conversation
        </TabsTrigger>
        <TabsTrigger value="details" icon="info">
          Details
        </TabsTrigger>
        <TabsTrigger value="activity" icon="clock" count={12}>
          Activity
        </TabsTrigger>
      </TabsList>
      <TabsContent value="conversation" className="text-muted-foreground">
        The customer reported the printer on floor 3 is offline.
      </TabsContent>
      <TabsContent value="details" className="text-muted-foreground">
        Requester, assignee, SLA …
      </TabsContent>
      <TabsContent value="activity" className="text-muted-foreground">
        12 events
      </TabsContent>
    </Tabs>
  ),
}

const STATES = ['default', 'hover', 'active', 'focus', 'disabled'] as const

/** variant × state — same grid as Figma 07 · Tabs. */
export const Matrix: Story = {
  parameters: {
    pseudo: { hover: ['.state-hover button'], focusVisible: ['.state-focus button'] },
  },
  render: () => (
    <table className="border-separate border-spacing-x-6 border-spacing-y-3">
      <thead>
        <tr>
          <th className="text-left text-caption font-normal text-muted-foreground">variant</th>
          {STATES.map((s) => (
            <th key={s} className="text-left text-caption font-normal text-muted-foreground">
              {s}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {(['pill', 'underline'] as const).map((variant) => (
          <tr key={variant}>
            <td className="pr-2 text-caption text-muted-foreground">{variant}</td>
            {STATES.map((state) => (
              <td key={state} className={`state-${state}`}>
                <Tabs value={state === 'active' ? 'x' : ''}>
                  <TabsList variant={variant} aria-label={`${variant} ${state}`}>
                    <TabsTrigger value="x" count={8} disabled={state === 'disabled'}>
                      Todo
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  ),
}
