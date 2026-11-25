import type { ReactNode } from 'react'
import { createBrowserRouter, Navigate, RouterProvider, useParams } from 'react-router'
import type { IconName } from '@/components/atoms'
import { ThemeProvider } from '@/lib/theme'
import { PlaceholderPage } from '@/pages/PlaceholderPage'
import { TicketsTablePage } from '@/pages/tickets/TicketsTablePage'
import { AppSidebar } from './AppSidebar'
import { defaultView, findNavItem, viewPath } from './nav'

/** Screens built so far, keyed by "module/view". Every other menu item gets a placeholder. */
const PAGES: Record<string, () => ReactNode> = {
  'inbox/all': () => <TicketsTablePage sidebar={<AppSidebar />} />,
}

function ViewRoute() {
  const { module = 'inbox', view } = useParams()
  if (!view) {
    const first = defaultView(module)
    return <Navigate to={first ? viewPath(module, first) : '/'} replace />
  }
  const page = PAGES[`${module}/${view}`]
  if (page) return page()
  const item = findNavItem(module, view)
  if (!item) return <Navigate to="/" replace />
  return (
    <PlaceholderPage
      sidebar={<AppSidebar />}
      title={item.label}
      icon={typeof item.icon === 'string' ? (item.icon as IconName) : undefined}
      count={item.count}
    />
  )
}

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/inbox/all" replace /> },
  { path: '/:module/:view?', element: <ViewRoute /> },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}
