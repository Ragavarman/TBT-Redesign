// Organisms — complete UI sections built from molecules and atoms.
// Organisms may import from molecules, atoms, ui/, lib/ and types/ (enforced by `npm run lint`).
// Data always comes in through props — never import from src/mocks here.

// 5a · Overlays
export * from './confirmation-modal'
export * from './dialog'

// 5b · Data
export * from './data-table'

// 5c · App navigation
export * from './app-rail'
export * from './sidebar'
export * from './sub-navigation'
export * from './workspace-header'

// 5d · Helpdesk
export * from './bulk-action-bar'
export * from './ticket-breadcrumb'
export * from './ticket-list-item'
export * from './ticket-panel'
export * from './ticket-row'

// 6a · Page pieces
export * from './chart-card'
export * from './composer-bar'
export * from './filter-chips'
export * from './kpi-strip'
export * from './page-header'
export * from './settings-section'
