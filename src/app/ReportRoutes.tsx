import { useNavigate } from 'react-router'
import { CustomReportPage } from '@/pages/reports/CustomReportPage'
import { WEEKLY_SUMMARY } from '@/pages/reports/custom-report'
import {
  AgentPerformancePage,
  ChannelsPage,
  SlaPerformancePage,
  TicketVolumePage,
} from '@/pages/reports/ReportDetailPages'
import { ReportsOverviewPage } from '@/pages/reports/ReportsOverviewPage'
import { AppSidebar } from './AppSidebar'
import { ticketPath, viewPath } from './nav'
import { useSavedViews } from './saved-views-context'
import { useWorkspace } from './workspace-context'

/** /reports/:view — Overview, the four reports, the builder and saved reports (Figma R1–R5, X18, X19). */
export function ReportsViewRoute({ view }: { view: string }) {
  const navigate = useNavigate()
  const { tickets } = useWorkspace()
  const { reports, saveReport } = useSavedViews()
  const sidebar = <AppSidebar />
  const props = { sidebar, tickets }

  switch (view) {
    case 'overview':
      return (
        <ReportsOverviewPage {...props} onOpenTicket={(id) => navigate(ticketPath('all', id))} />
      )
    case 'volume':
      return <TicketVolumePage {...props} />
    case 'sla':
      return <SlaPerformancePage {...props} />
    case 'agents':
      return <AgentPerformancePage {...props} />
    case 'channels':
      return <ChannelsPage {...props} />
  }

  // the builder: a new report, Weekly summary, or one the agent saved
  const saved = view === 'weekly' ? WEEKLY_SUMMARY : reports.find((r) => r.id === view)
  if (view !== 'new' && !saved) return null
  return (
    <CustomReportPage
      key={view}
      sidebar={sidebar}
      report={saved}
      onCancel={() => navigate(viewPath('reports', 'overview'))}
      onSave={(r) => {
        saveReport(r)
        navigate(viewPath('reports', r.id))
      }}
    />
  )
}
