import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'

// This package is a component library; the real showcase is Storybook (`npm run storybook`).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <main className="p-8 font-sans">
      <h1 className="text-2xl font-semibold">TBT Design System</h1>
      <p className="text-sm">Run Storybook to browse components.</p>
    </main>
  </StrictMode>,
)
