import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from '@/components/atoms'
import { currentAgent, moduleNav, railFooterModules, railModules } from '@/mocks'
import { AppRail } from '../app-rail'
import { SubNavigation } from '../sub-navigation'
import { WorkspaceHeader } from '../workspace-header'
import { Sidebar } from './Sidebar'

const meta = {
  title: 'Organisms/Sidebar',
  component: Sidebar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Sidebar>

export default meta
type Story = StoryObj<typeof meta>

const headerActions = (
  <>
    <IconButton icon="search" label="Search" size="sm" />
    <IconButton icon="plus" label="New ticket" size="sm" />
  </>
)

const user = { name: currentAgent.name, presence: currentAgent.presence }

/**
 * Figma 07 · Apprail-max — click rail modules to switch the menu, rows to change the
 * active view, and the edge tab to collapse to the rail.
 */
export const Interactive: Story = {
  args: { rail: { modules: railModules }, nav: { title: '', sections: [] } },
  render: () => {
    function Demo() {
      const [module, setModule] = useState('inbox')
      const [active, setActive] = useState('my-tickets')
      const nav = moduleNav[module] ?? moduleNav.inbox!
      return (
        <div className="h-[56rem] bg-background p-4">
          <Sidebar
            rail={{
              modules: railModules,
              footerModules: railFooterModules,
              activeId: module,
              onSelect: (m) => {
                if (!moduleNav[m.id]) return // search / notifications are actions, not modules
                setModule(m.id)
                setActive(moduleNav[m.id]!.sections[0]?.items[0]?.id ?? '')
              },
              user,
            }}
            nav={{
              title: nav.title,
              actions: module === 'inbox' ? headerActions : undefined,
              sections: nav.sections,
              activeId: active,
              onSelect: (item) => setActive(item.id),
            }}
          />
        </div>
      )
    }
    return <Demo />
  },
}

/** Figma 07 · Apprail-max state=collapsed. */
export const Collapsed: Story = {
  args: {
    defaultCollapsed: true,
    rail: { modules: railModules, footerModules: railFooterModules, activeId: 'inbox', user },
    nav: { title: moduleNav.inbox!.title, sections: moduleNav.inbox!.sections },
  },
  decorators: [(Story) => <div className="h-[56rem] bg-background p-4">{Story()}</div>],
}

/** Figma 07 · App rail on its own. */
export const AppRailOnly: StoryObj<typeof AppRail> = {
  render: () => (
    <div className="h-[56rem] bg-background p-4">
      <AppRail
        modules={railModules}
        footerModules={railFooterModules}
        activeId="inbox"
        user={user}
        className="rounded-xl border border-sidebar-border"
      />
    </div>
  ),
}

/** Every module's sub-navigation side by side (Figma 07 · Sub navigation / *). */
export const AllSubNavigations: StoryObj<typeof SubNavigation> = {
  render: () => (
    <div className="flex gap-4 overflow-x-auto bg-background p-4">
      {Object.entries(moduleNav).map(([id, nav]) => (
        <div
          key={id}
          className="h-[52rem] w-60 shrink-0 overflow-hidden rounded-xl border border-sidebar-border"
        >
          <SubNavigation
            title={nav.title}
            sections={nav.sections}
            activeId={nav.sections[0]?.items[0]?.id}
            actions={id === 'inbox' ? headerActions : undefined}
          />
        </div>
      ))}
    </div>
  ),
}

export const WorkspaceHeaderOnly: StoryObj<typeof WorkspaceHeader> = {
  render: () => (
    <div className="w-60 rounded-xl border border-sidebar-border bg-sidebar">
      <WorkspaceHeader title="TBT Support" subtitle="12 agents online" actions={headerActions} />
    </div>
  ),
  parameters: { layout: 'centered' },
}
